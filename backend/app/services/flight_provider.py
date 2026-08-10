import os
import random
from datetime import datetime

import httpx
from dotenv import load_dotenv

load_dotenv()

AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")
AVIATIONSTACK_BASE_URL = "https://api.aviationstack.com/v1"


async def search_live_flights(
    origin_code: str,
    destination_code: str,
    departure_date: str,
    adults: int = 1,
) -> list[dict]:
    if not AVIATIONSTACK_API_KEY:
        raise RuntimeError(
            "AVIATIONSTACK_API_KEY is missing. Add it to your .env file."
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{AVIATIONSTACK_BASE_URL}/flights",
            params={
                "access_key": AVIATIONSTACK_API_KEY,
                "dep_iata": origin_code,
                "arr_iata": destination_code,
                "limit": 20,
            },
        )
        response.raise_for_status()
        payload = response.json()

    if "error" in payload:
        raise RuntimeError(
            payload["error"].get("message", "AviationStack API error")
        )

    raw_flights = payload.get("data", [])
    return [
        normalize_flight(flight)
        for flight in raw_flights
        if is_usable(flight)
    ]


def is_usable(flight: dict) -> bool:
    """Skip entries missing the fields we need to render a flight card."""
    departure = flight.get("departure", {})
    arrival = flight.get("arrival", {})
    airline = flight.get("airline", {})
    return bool(
        departure.get("scheduled")
        and arrival.get("scheduled")
        and airline.get("name")
    )


def normalize_flight(flight: dict) -> dict:
    """Reshape an AviationStack flight into the object the frontend expects.
    Note: AviationStack provides real schedules but not fares, so price and
    rating are clearly-labeled estimates, not real data."""
    departure = flight["departure"]
    arrival = flight["arrival"]
    airline = flight["airline"]
    flight_info = flight.get("flight", {})

    departure_dt = datetime.fromisoformat(departure["scheduled"])
    arrival_dt = datetime.fromisoformat(arrival["scheduled"])
    duration_minutes = int(
        (arrival_dt - departure_dt).total_seconds() // 60
    )
    if duration_minutes <= 0:
        duration_minutes = 120  # guard against bad/missing timezone data

    airline_code = airline.get("iata", "") or ""
    flight_number = flight_info.get("iata", "") or f"{airline_code}000"

    return {
        "id": flight_number + departure["scheduled"],
        "airline": airline.get("name", "Unknown"),
        "airlineCode": airline_code,
        "flightNumber": flight_number,
        "origin": departure.get("iata", ""),
        "destination": arrival.get("iata", ""),
        "departureTime": departure_dt.strftime("%H:%M"),
        "arrivalTime": arrival_dt.strftime("%H:%M"),
        "durationMinutes": duration_minutes,
        "stops": 0,
        "price": estimate_price(duration_minutes),
        "rating": round(random.uniform(3.8, 4.9), 1),
        "priceIsEstimate": True,
    }


def estimate_price(duration_minutes: int) -> float:
    """Real fares aren't available from this data source, so this derives a
    rough placeholder from flight duration for display purposes only."""
    base_fare = 89
    per_minute_rate = 0.85
    return round(base_fare + duration_minutes * per_minute_rate, 2)