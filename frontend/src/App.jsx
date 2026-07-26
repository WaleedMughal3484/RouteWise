import { useState } from "react";
import "./App.css";

function App() {
  const [tripType, setTripType] = useState("round-trip");
  const [errors, setErrors] = useState({});
  const [searchSummary, setSearchSummary] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

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

    const submittedOrigin = formData.get("origin").trim();
    const submittedDestination = formData.get("destination").trim();
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

    if (
      submittedOrigin &&
      submittedDestination &&
      submittedOrigin.toLowerCase() === submittedDestination.toLowerCase()
    ) {
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
      return;
    }

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
                <option value="british-airways">British Airways</option>
              </select>
            </div>

            <label className="checkbox-group">
              <input type="checkbox" name="directFlights" />
              Direct flights only
            </label>
          </div>

          <button type="submit" disabled={sameCity}>
            Search Flights
          </button>
        </form>
      </section>

      {searchSummary && (
        <section className="results-card" aria-live="polite">
          <p className="results-eyebrow">Search submitted</p>

          <h2>
            {searchSummary.origin} to {searchSummary.destination}
          </h2>

          <div className="summary-grid">
            <div>
              <span>Trip</span>
              <strong>
                {searchSummary.tripType === "round-trip"
                  ? "Round trip"
                  : "One way"}
              </strong>
            </div>

            <div>
              <span>Departure</span>
              <strong>{formatDate(searchSummary.departure)}</strong>
            </div>

            {searchSummary.tripType === "round-trip" && (
              <div>
                <span>Return</span>
                <strong>{formatDate(searchSummary.returnDate)}</strong>
              </div>
            )}

            <div>
              <span>Passengers</span>
              <strong>{searchSummary.passengers}</strong>
            </div>

            <div>
              <span>Cabin</span>
              <strong>{formatOption(searchSummary.cabinClass)}</strong>
            </div>

            <div>
              <span>Airline</span>
              <strong>
                {searchSummary.airline === "all"
                  ? "All Airlines"
                  : formatOption(searchSummary.airline)}
              </strong>
            </div>

            <div>
              <span>Flight preference</span>
              <strong>
                {searchSummary.directFlights
                  ? "Direct flights only"
                  : "Any number of stops"}
              </strong>
            </div>
          </div>

          <p className="results-note">
            Live flight results will appear here after the flight API is
            connected.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;