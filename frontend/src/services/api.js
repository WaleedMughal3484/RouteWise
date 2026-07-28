const API_BASE_URL = "http://127.0.0.1:8000";

export async function searchFlights(origin, destination) {
  const query = new URLSearchParams({
    origin,
    destination,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/flights?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve flights from the RouteWise API.");
  }

  return response.json();
}