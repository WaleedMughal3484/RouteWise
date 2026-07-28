from fastapi import FastAPI

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