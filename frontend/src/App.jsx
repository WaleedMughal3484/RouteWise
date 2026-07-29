import { useMemo, useState } from "react";
import { searchFlights } from "./services/api";
import "./App.css";

function App() {
  const [tripType, setTripType] = useState("round-trip");
  const [errors, setErrors] = useState({});
  const [searchSummary, setSearchSummary] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sortBy, setSortBy] = useState("cheapest");
  const [flights, setFlights] = useState([]);
  const [apiError, setApiError] = useState("");
  const [departureDate, setDepartureDate] = useState("");



  const sameCity =
    origin.trim() !== "" &&
    destination.trim() !== "" &&
    origin.trim().toLowerCase() === destination.trim().toLowerCase();

  function handleTripTypeChange(event) {
    const selectedTripType = event.target.value;

    setTripType(selectedTripType);

    if (selectedTripType === "one-way") {
      setErrors((currentErrors) => ({
        ...currentErrors,
        returnDate: "",
      }));
    }
  }

  function handleSwapCities() {
    setOrigin(destination);
    setDestination(origin);
    setErrors({});
    setApiError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const submittedOrigin = origin.trim();
    const submittedDestination = destination.trim();
    const departure = formData.get("departure");
    const returnDate = formData.get("return");
    const passengers = formData.get("passengers");
    const cabinClass = formData.get("cabinClass");
    const airline = formData.get("airline");
    const directFlights = formData.get("directFlights") === "on";

    const newErrors = {};

    if (!submittedOrigin) {
      newErrors.origin = "Please enter a departure city.";
    }

    if (!submittedDestination) {
      newErrors.destination = "Please enter a destination city.";
    }

    if (!departure) {
      newErrors.departure = "Please select a departure date.";
    }

    if (sameCity) {
      newErrors.destination =
        "Your destination must be different from your departure city.";
    }

    if (
      tripType === "round-trip" &&
      departure &&
      returnDate &&
      returnDate < departure
    ) {
      newErrors.returnDate =
        "The return date cannot be earlier than the departure date.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSearchSummary(null);
      setSelectedFlight(null);
      setFlights([]);
      setApiError("");
      return;
    }

    setIsLoading(true);
    setSearchSummary(null);
    setSelectedFlight(null);
    setSortBy("cheapest");
    setFlights([]);
    setApiError("");

    try {
      const response = await searchFlights(
        submittedOrigin,
        submittedDestination
      );

      setFlights(response.flights);

      setSearchSummary({
        origin: response.origin,
        destination: response.destination,
        departure,
        returnDate,
        passengers,
        cabinClass,
        airline,
        directFlights,
        tripType,
      });
    } catch (error) {
      console.error("Flight search failed:", error);

      setApiError(
        "We could not retrieve flights. Make sure the RouteWise backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function formatOption(value) {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatCity(value) {
    return value
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function formatDate(date) {
    if (!date) {
      return "Not selected";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(price);
  }

  function formatDuration(durationMinutes) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  function formatTime(time) {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const visibleFlights = useMemo(() => {
    if (!searchSummary) {
      return [];
    }

    let filteredFlights = [...flights];

    if (searchSummary.airline !== "all") {
      const preferredAirline = formatOption(searchSummary.airline);

      filteredFlights = filteredFlights.filter(
        (flight) =>
          flight.airline.toLowerCase() === preferredAirline.toLowerCase()
      );
    }

    if (searchSummary.directFlights) {
      filteredFlights = filteredFlights.filter(
        (flight) => flight.stops === 0
      );
    }

    if (sortBy === "cheapest") {
      filteredFlights.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "fastest") {
      filteredFlights.sort(
        (a, b) => a.durationMinutes - b.durationMinutes
      );
    }

    if (sortBy === "highest-rated") {
      filteredFlights.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "fewest-stops") {
      filteredFlights.sort(
        (a, b) => a.stops - b.stops || a.price - b.price
      );
    }

    return filteredFlights;
  }, [flights, searchSummary, sortBy]);

  const flightInsights = useMemo(() => {
    if (visibleFlights.length === 0) {
      return null;
    }

    const cheapest = visibleFlights.reduce((bestFlight, currentFlight) =>
      currentFlight.price < bestFlight.price ? currentFlight : bestFlight
    );

    const fastest = visibleFlights.reduce((bestFlight, currentFlight) =>
      currentFlight.durationMinutes < bestFlight.durationMinutes
        ? currentFlight
        : bestFlight
    );

    const highestRated = visibleFlights.reduce(
      (bestFlight, currentFlight) =>
        currentFlight.rating > bestFlight.rating
          ? currentFlight
          : bestFlight
    );

    return {
      cheapest,
      fastest,
      highestRated,
    };
  }, [visibleFlights]);

  function buildRoute(flight) {
    return `${formatCity(flight.origin)} → ${formatCity(
      flight.destination
    )}`;
  }

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Flight Intelligence Platform</p>

        <h1>Find a flight that fits your trip.</h1>

        <p className="subtitle">
          Search and compare flights by price, duration, airline, and number of
          stops.
        </p>
      </header>

      <section className="search-card">
        <form className="search-form" onSubmit={handleSubmit} noValidate>
          <div className="trip-type-group">
            <label>
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={handleTripTypeChange}
              />
              Round trip
            </label>

            <label>
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={handleTripTypeChange}
              />
              One way
            </label>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="origin">From</label>

              <input
                id="origin"
                name="origin"
                type="text"
                placeholder="Halifax"
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                aria-invalid={Boolean(errors.origin)}
                aria-describedby={errors.origin ? "origin-error" : undefined}
              />

              {errors.origin && (
                <p className="error-message" id="origin-error">
                  {errors.origin}
                </p>
              )}
            </div>

            <div className="swap-control">
              <button
                type="button"
                className="swap-button"
                onClick={handleSwapCities}
                aria-label="Swap departure and destination cities"
                title="Swap cities"
              >
                ⇄
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="destination">To</label>

              <input
                id="destination"
                name="destination"
                type="text"
                placeholder="Lahore"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                aria-invalid={Boolean(errors.destination) || sameCity}
                aria-describedby={
                  errors.destination || sameCity
                    ? "destination-error"
                    : undefined
                }
              />

              {(errors.destination || sameCity) && (
                <p className="error-message" id="destination-error">
                  {sameCity
                    ? "Your destination must be different from your departure city."
                    : errors.destination}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="departure">Departure</label>

                            <input
                id="departure"
                name="departure"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                aria-invalid={Boolean(errors.departure)}
                aria-describedby={
                  errors.departure ? "departure-error" : undefined
                }
              />

              {errors.departure && (
                <p className="error-message" id="departure-error">
                  {errors.departure}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="return">Return</label>

              <input
  id="return"
  name="return"
  type="date"
  min={departureDate || new Date().toISOString().split("T")[0]}
  disabled={tripType === "one-way"}
  aria-invalid={Boolean(errors.returnDate)}
  aria-describedby={
    errors.returnDate ? "return-error" : undefined
  }
/>

              {errors.returnDate && (
                <p className="error-message" id="return-error">
                  {errors.returnDate}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passengers">Passengers</label>

              <input
                id="passengers"
                name="passengers"
                type="number"
                min="1"
                max="9"
                defaultValue="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cabinClass">Cabin class</label>

              <select
                id="cabinClass"
                name="cabinClass"
                defaultValue="economy"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium economy</option>
                <option value="business">Business</option>
                <option value="first">First class</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="airline">Preferred airline</label>

              <select id="airline" name="airline" defaultValue="all">
                <option value="all">All airlines</option>
                <option value="air-canada">Air Canada</option>
                <option value="westjet">WestJet</option>
                <option value="porter-airlines">Porter Airlines</option>
              </select>
            </div>

            <label className="checkbox-group">
              <input type="checkbox" name="directFlights" />
              Direct flights only
            </label>
          </div>

          <button type="submit" disabled={sameCity || isLoading}>
            {isLoading ? "Searching..." : "Search Flights"}
          </button>
        </form>
      </section>

      {isLoading && (
        <section className="loading-card" aria-live="polite">
          <div className="spinner" />

          <h2>Searching for flights</h2>

          <p>
            Comparing routes from {formatCity(origin)} to{" "}
            {formatCity(destination)}...
          </p>
        </section>
      )}

      {apiError && !isLoading && (
        <section className="empty-results" aria-live="polite">
          <h3>Flight search failed</h3>
          <p>{apiError}</p>
        </section>
      )}

      {searchSummary && !isLoading && !apiError && (
        <section className="results-section" aria-live="polite">
          <div className="results-header">
            <div>
              <p className="results-eyebrow">Available flights</p>

              <h2>
                {formatCity(searchSummary.origin)} to{" "}
                {formatCity(searchSummary.destination)}
              </h2>

              <p className="results-subtitle">
                {formatDate(searchSummary.departure)} ·{" "}
                {searchSummary.passengers} passenger
                {Number(searchSummary.passengers) > 1 ? "s" : ""} ·{" "}
                {formatOption(searchSummary.cabinClass)}
              </p>
            </div>

            <div className="results-count">
              {visibleFlights.length} flight
              {visibleFlights.length !== 1 ? "s" : ""}
            </div>
          </div>

          {flightInsights && (
            <div className="insights-grid">
              <article className="insight-card">
                <span>Cheapest flight</span>
                <strong>{formatPrice(flightInsights.cheapest.price)}</strong>
                <p>{flightInsights.cheapest.airline}</p>
              </article>

              <article className="insight-card">
                <span>Fastest flight</span>
                <strong>
                  {formatDuration(flightInsights.fastest.durationMinutes)}
                </strong>
                <p>{flightInsights.fastest.airline}</p>
              </article>

              <article className="insight-card">
                <span>Best rated</span>
                <strong>★ {flightInsights.highestRated.rating}</strong>
                <p>{flightInsights.highestRated.airline}</p>
              </article>

              <article className="insight-card">
                <span>Flights found</span>
                <strong>{visibleFlights.length}</strong>
                <p>Matching your search</p>
              </article>
            </div>
          )}

          {visibleFlights.length > 0 && (
            <div className="results-toolbar">
              <div>
                <h3>Compare flights</h3>
                <p>Sort the available options based on your priorities.</p>
              </div>

              <div className="sort-group">
                <label htmlFor="sortBy">Sort by</label>

                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="cheapest">Cheapest</option>
                  <option value="fastest">Fastest</option>
                  <option value="highest-rated">Highest rated</option>
                  <option value="fewest-stops">Fewest stops</option>
                </select>
              </div>
            </div>
          )}

          {visibleFlights.length > 0 ? (
            <div className="flight-list">
              {visibleFlights.map((flight) => (
                <article className="flight-card" key={flight.id}>
                  <div className="airline-section">
                    <div className="airline-logo">
                      {flight.airlineCode}
                    </div>

                    <div>
                      <h3>{flight.airline}</h3>
                      <p>{buildRoute(flight)}</p>
                    </div>
                  </div>

                  <div className="flight-time">
                    <div>
                      <span>Departure</span>
                      <strong>{formatTime(flight.departureTime)}</strong>
                    </div>

                    <div className="route-line">
                      <span>{formatDuration(flight.durationMinutes)}</span>
                      <div className="line" />
                      <span>
                        {flight.stops} stop
                        {flight.stops !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div>
                      <span>Arrival</span>
                      <strong>{formatTime(flight.arrivalTime)}</strong>
                    </div>
                  </div>

                  <div className="flight-price">
                    <div className="rating">★ {flight.rating}</div>

                    <span>From</span>
                    <strong>{formatPrice(flight.price)}</strong>
                    <small>per passenger</small>

                    <button
                      type="button"
                      className="details-button"
                      onClick={() =>
                        setSelectedFlight(
                          selectedFlight === flight.id ? null : flight.id
                        )
                      }
                    >
                      {selectedFlight === flight.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>
                  </div>

                  {selectedFlight === flight.id && (
                    <div className="flight-details">
                      <div>
                        <span>Airline</span>
                        <strong>{flight.airline}</strong>
                      </div>

                      <div>
                        <span>Flight number</span>
                        <strong>{flight.flightNumber}</strong>
                      </div>

                      <div>
                        <span>Trip type</span>
                        <strong>
                          {searchSummary.tripType === "round-trip"
                            ? "Round trip"
                            : "One way"}
                        </strong>
                      </div>

                      <div>
                        <span>Cabin</span>
                        <strong>
                          {formatOption(searchSummary.cabinClass)}
                        </strong>
                      </div>

                      <div>
                        <span>Stops</span>
                        <strong>{flight.stops}</strong>
                      </div>

                      <div>
                        <span>Total duration</span>
                        <strong>
                          {formatDuration(flight.durationMinutes)}
                        </strong>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <h3>No matching flights found</h3>

              <p>
                Try selecting all airlines or turning off direct flights only.
              </p>
            </div>
          )}

          <p className="results-note">
            These results currently come from the RouteWise mock backend. Live
            pricing and availability will appear after the external flight API
            is connected.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;