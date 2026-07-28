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
    origin: str = Query(..., min_length=3, max_length=3),
    destination: str = Query(..., min_length=3, max_length=3),
) -> dict:
    flights = [
        {
            "id": 1,
            "airline": "Air Canada",
            "airlineCode": "AC",
            "flightNumber": "AC101",
            "origin": origin.upper(),
            "destination": destination.upper(),
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
            "origin": origin.upper(),
            "destination": destination.upper(),
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
            "origin": origin.upper(),
            "destination": destination.upper(),
            "departureTime": "17:40",
            "arrivalTime": "21:05",
            "durationMinutes": 205,
            "stops": 0,
            "price": 395,
            "rating": 4.4,
        },
    ]

    return {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "count": len(flights),
        "flights": flights,
    }