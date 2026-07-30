import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="RouteWise API",
    description="Backend API for the RouteWise Flight Intelligence Platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIRECTORY = Path(__file__).resolve().parent
FLIGHTS_FILE = BASE_DIRECTORY / "data" / "flights.json"


def load_flights() -> list[dict[str, Any]]:
    try:
        with FLIGHTS_FILE.open("r", encoding="utf-8") as file:
            flights = json.load(file)
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail="The flight data file could not be found.",
        ) from error
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail="The flight data file contains invalid JSON.",
        ) from error

    if not isinstance(flights, list):
        raise HTTPException(
            status_code=500,
            detail="The flight data file must contain a list of flights.",
        )

    return flights


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Welcome to the RouteWise API",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "RouteWise API",
    }


@app.get("/api/flights")
def get_flights(
    origin: str = Query(..., min_length=2, max_length=50),
    destination: str = Query(..., min_length=2, max_length=50),
) -> dict[str, Any]:
    formatted_origin = origin.strip().title()
    formatted_destination = destination.strip().title()

    if formatted_origin.casefold() == formatted_destination.casefold():
        raise HTTPException(
            status_code=400,
            detail="Origin and destination must be different.",
        )

    stored_flights = load_flights()

    matching_flights = [
        flight
        for flight in stored_flights
        if flight.get("origin", "").casefold() == formatted_origin.casefold()
        and flight.get("destination", "").casefold()
        == formatted_destination.casefold()
    ]

    return {
        "origin": formatted_origin,
        "destination": formatted_destination,
        "count": len(matching_flights),
        "flights": matching_flights,
    }