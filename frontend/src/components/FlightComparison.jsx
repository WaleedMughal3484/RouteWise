export default function FlightComparison({
  flights,
  onRemove,
  onClear,
  formatPrice,
  formatDuration,
  formatTime,
}) {
  if (!flights || flights.length === 0) {
    return null;
  }

  return (
    <section className="comparison-section">
      <div className="comparison-header">
        <div>
          <p className="comparison-eyebrow">
            Side-by-side analysis
          </p>

          <h2>Compare Flights</h2>

          <p>
            Select up to three flights and compare their
            main details.
          </p>
        </div>

        <button
          type="button"
          className="clear-comparison-button"
          onClick={onClear}
        >
          Clear Comparison
        </button>
      </div>

      {flights.length < 2 ? (
        <p className="comparison-hint">
          Select at least one more flight to begin comparing.
        </p>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>

                {flights.map((flight) => (
                  <th key={flight.id}>
                    <div className="comparison-flight-heading">
                      <strong>{flight.airline}</strong>
                      <span>{flight.flightNumber}</span>

                      <button
                        type="button"
                        onClick={() => onRemove(flight.id)}
                        aria-label={`Remove ${flight.airline} from comparison`}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <th>Route</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {flight.origin} → {flight.destination}
                  </td>
                ))}
              </tr>

              <tr>
                <th>Price</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {formatPrice(flight.price)}
                  </td>
                ))}
              </tr>

              <tr>
                <th>Duration</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {formatDuration(flight.durationMinutes)}
                  </td>
                ))}
              </tr>

              <tr>
                <th>Stops</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {flight.stops === 0
                      ? "Direct"
                      : `${flight.stops} stop${
                          flight.stops !== 1 ? "s" : ""
                        }`}
                  </td>
                ))}
              </tr>

              <tr>
                <th>Rating</th>
                {flights.map((flight) => (
                  <td key={flight.id}>★ {flight.rating}</td>
                ))}
              </tr>

              <tr>
                <th>Departure</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {formatTime(flight.departureTime)}
                  </td>
                ))}
              </tr>

              <tr>
                <th>Arrival</th>
                {flights.map((flight) => (
                  <td key={flight.id}>
                    {formatTime(flight.arrivalTime)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}