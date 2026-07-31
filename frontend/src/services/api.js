const API_BASE_URL = "http://127.0.0.1:8000";

export async function searchFlights({
  origin,
  destination,
  airline,
  directOnly,
  maxPrice,
  sortBy,
}) {
  const params = new URLSearchParams();

  if (origin) {
    params.set("origin", origin);
  }

  if (destination) {
    params.set("destination", destination);
  }

  if (airline) {
    params.set("airline", airline);
  }

  if (directOnly) {
    params.set("direct_only", "true");
  }

  if (maxPrice !== undefined) {
    params.set("max_price", String(maxPrice));
  }

  if (sortBy) {
    params.set("sort_by", sortBy);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/flights?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Flight search failed with status ${response.status}`
    );
  }

  return response.json();
}