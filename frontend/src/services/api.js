const API_BASE_URL = "http://127.0.0.1:8000";

export async function searchFlights({
  origin,
  destination,
  airline,
  directOnly = false,
  maxPrice,
  sortBy,
}) {
  const query = new URLSearchParams({
    origin,
    destination,
  });

  if (airline) {
    query.set("airline", airline);
  }

  if (directOnly) {
    query.set("direct_only", "true");
  }

  if (
    maxPrice !== undefined &&
    maxPrice !== null &&
    maxPrice !== ""
  ) {
    query.set("max_price", String(maxPrice));
  }

  if (sortBy) {
    query.set("sort_by", sortBy);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/flights?${query.toString()}`
  );

  if (!response.ok) {
    let message =
      "Unable to retrieve flights from the RouteWise API.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}