export default function Favorites({
  favorites,
  onRemove,
  onClear,
  formatPrice,
  formatDuration,
}) {
  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <section className="favorites-section">
      <div className="favorites-header">
        <div>
          <p className="favorites-eyebrow">
            Saved flights
          </p>

          <h2>Favorite Flights</h2>

          <p>
            Your saved flights remain available after
            refreshing the page.
          </p>
        </div>

        <button
          type="button"
          className="clear-favorites-button"
          onClick={onClear}
        >
          Clear Favorites
        </button>
      </div>

      <div className="favorites-list">
        {favorites.map((flight) => (
          <article
            className="favorite-card"
            key={flight.id}
          >
            <div className="favorite-airline">
              <div className="airline-logo">
                {flight.airlineCode}
              </div>

              <div>
                <h3>{flight.airline}</h3>

                <p>
                  {flight.origin} → {flight.destination}
                </p>

                <small>
                  {flight.flightNumber}
                </small>
              </div>
            </div>

            <div className="favorite-details">
              <div>
                <span>Price</span>

                <strong>
                  {formatPrice(flight.price)}
                </strong>
              </div>

              <div>
                <span>Duration</span>

                <strong>
                  {formatDuration(
                    flight.durationMinutes
                  )}
                </strong>
              </div>

              <div>
                <span>Stops</span>

                <strong>
                  {flight.stops === 0
                    ? "Direct"
                    : `${flight.stops} stop${
                        flight.stops !== 1 ? "s" : ""
                      }`}
                </strong>
              </div>

              <div>
                <span>Rating</span>

                <strong>★ {flight.rating}</strong>
              </div>
            </div>

            <button
              type="button"
              className="remove-favorite-button"
              onClick={() => onRemove(flight.id)}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}