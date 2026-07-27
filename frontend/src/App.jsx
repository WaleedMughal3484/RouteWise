import { useState } from "react";
import "./App.css";

const mockFlights = [
  {
    id: 1,
    airline: "Qatar Airways",
    code: "QR",
    price: 1428,
    duration: "23h 40m",
    stops: 2,
    rating: 4.8,
    departureTime: "10:15 AM",
    arrivalTime: "4:55 PM",
    connectionCities: ["Montreal", "Doha"],
  },
  {
    id: 2,
    airline: "Turkish Airlines",
    code: "TK",
    price: 1367,
    duration: "25h 15m",
    stops: 2,
    rating: 4.7,
    departureTime: "6:30 PM",
    arrivalTime: "11:45 PM",
    connectionCities: ["Toronto", "Istanbul"],
  },
  {
    id: 3,
    airline: "Air Canada",
    code: "AC",
    price: 1612,
    duration: "24h 55m",
    stops: 2,
    rating: 4.6,
    departureTime: "8:20 AM",
    arrivalTime: "3:15 PM",
    connectionCities: ["Toronto", "London"],
  },
  {
    id: 4,
    airline: "Emirates",
    code: "EK",
    price: 1549,
    duration: "26h 10m",
    stops: 2,
    rating: 4.8,
    departureTime: "2:40 PM",
    arrivalTime: "8:50 PM",
    connectionCities: ["Boston", "Dubai"],
  },
];

function App() {
  const [tripType, setTripType] = useState("round-trip");
  const [errors, setErrors] = useState({});
  const [searchSummary, setSearchSummary] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

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

  function handleSubmit(event) {
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
      return;
    }

    setIsLoading(true);
    setSearchSummary(null);
    setSelectedFlight(null);

    setTimeout(() => {
      setSearchSummary({
        origin: submittedOrigin,
        destination: submittedDestination,
        departure,
        returnDate,
        passengers,
        cabinClass,
        airline,
        directFlights,
        tripType,
      });

      setIsLoading(false);
    }, 1000);
  }

  function formatOption(value) {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

  function getVisibleFlights() {
    if (!searchSummary) {
      return [];
    }

    let flights = [...mockFlights];

    if (searchSummary.airline !== "all") {
      const preferredAirline = formatOption(searchSummary.airline);

      flights = flights.filter(
        (flight) =>
          flight.airline.toLowerCase() === preferredAirline.toLowerCase()
      );
    }

    if (searchSummary.directFlights) {
      flights = flights.filter((flight) => flight.stops === 0);
    }

    return flights;
  }

  function buildRoute(flight) {
    if (!searchSummary) {
      return "";
    }

    return [
      searchSummary.origin,
      ...flight.connectionCities,
      searchSummary.destination,
    ].join(" → ");
  }

  const visibleFlights = getVisibleFlights();

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
                <option value="qatar-airways">Qatar Airways</option>
                <option value="emirates">Emirates</option>
                <option value="turkish-airlines">Turkish Airlines</option>
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
            Comparing routes from {origin.trim()} to {destination.trim()}...
          </p>
        </section>
      )}

      {searchSummary && !isLoading && (
        <section className="results-section" aria-live="polite">
          <div className="results-header">
            <div>
              <p className="results-eyebrow">Available flights</p>

              <h2>
                {searchSummary.origin} to {searchSummary.destination}
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

          {visibleFlights.length > 0 ? (
            <div className="flight-list">
              {visibleFlights.map((flight) => (
                <article className="flight-card" key={flight.id}>
                  <div className="airline-section">
                    <div className="airline-logo">{flight.code}</div>

                    <div>
                      <h3>{flight.airline}</h3>
                      <p>{buildRoute(flight)}</p>
                    </div>
                  </div>

                  <div className="flight-time">
                    <div>
                      <span>Departure</span>
                      <strong>{flight.departureTime}</strong>
                    </div>

                    <div className="route-line">
                      <span>{flight.duration}</span>
                      <div className="line" />
                      <span>
                        {flight.stops} stop{flight.stops !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div>
                      <span>Arrival</span>
                      <strong>{flight.arrivalTime}</strong>
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
                        <span>Flight code</span>
                        <strong>
                          {flight.code}
                          {100 + flight.id}
                        </strong>
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
                        <strong>{flight.duration}</strong>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <h3>No matching mock flights found</h3>
              <p>
                Try selecting all airlines or turning off direct flights only.
              </p>
            </div>
          )}

          <p className="results-note">
            These are sample results. Live pricing and availability will appear
            after the flight API is connected.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;