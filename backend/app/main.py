from fastapi import FastAPI, Query

app = FastAPI(
    title="RouteWise API",
    description="Backend API for the RouteWise Flight Intelligence Platform.",
    version="1.0.0",
)


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
) -> dict:
    formatted_origin = origin.strip().title()
    formatted_destination = destination.strip().title()

    flights = [
        {
            "id": 1,
            "airline": "Air Canada",
            "airlineCode": "AC",
            "flightNumber": "AC101",
            "origin": formatted_origin,
            "destination": formatted_destination,
            "departureTime": "08:30",
            "arrivalTime": "11:45",
            "durationMinutes": 195,
            "stops": 0,
            "price": 425,
            "rating": 4.5,
        },
        {
            "id": 2,
            "airline": "WestJet",
            "airlineCode": "WS",
            "flightNumber": "WS220",
            "origin": formatted_origin,
            "destination": formatted_destination,
            "departureTime": "12:15",
            "arrivalTime": "16:10",
            "durationMinutes": 235,
            "stops": 1,
            "price": 365,
            "rating": 4.2,
        },
        {
            "id": 3,
            "airline": "Porter Airlines",
            "airlineCode": "PD",
            "flightNumber": "PD450",
            "origin": formatted_origin,
            "destination": formatted_destination,
            "departureTime": "17:40",
            "arrivalTime": "21:05",
            "durationMinutes": 205,
            "stops": 0,
            "price": 395,
            "rating": 4.4,
        },
    ]

    return {
        "origin": formatted_origin,
        "destination": formatted_destination,
        "count": len(flights),
        "flights": flights,
    }