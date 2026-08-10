import { useMemo, useState } from "react";
import { searchFlights, searchLiveFlights } from "./services/api";
import "./App.css";
import RecentSearches from "./components/RecentSearches";
import useRecentSearches from "./hooks/useRecentSearches";
import Favorites from "./components/Favorites";
import useFavorites from "./hooks/useFavorites";
import AirportAutocomplete from "./components/AirportAutocomplete";
import FlightComparison from "./components/FlightComparison";
import useFlightComparison from "./hooks/useFlightComparison";

// Matches the "code" field on objects from data/airports.js
function getAirportCode(airportObject) {
  if (!airportObject) {
    return null;
  }

  const candidate = airportObject.code || null;

  if (candidate && /^[A-Za-z]{3}$/.test(candidate)) {
    return candidate.toUpperCase();
  }

  return null;
}

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
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedOriginAirport, setSelectedOriginAirport] =
  useState(null);

const [selectedDestinationAirport, setSelectedDestinationAirport] =
  useState(null);

  const {
  recentSearches,
  addSearch,
} = useRecentSearches();

const {
  favorites,
  isFavorite,
  toggleFavorite,
  removeFavorite,
  clearFavorites,
} = useFavorites();

const {
  comparedFlights,
  isCompared,
  toggleComparison,
  removeComparedFlight,
  clearComparison,
  comparisonLimit,
} = useFlightComparison();

  const sameCity =
    origin.trim() !== "" &&
    destination.trim() !== "" &&
    origin.trim().toLowerCase() ===
      destination.trim().toLowerCase();

  const canSearchLiveHint = Boolean(
    getAirportCode(selectedOriginAirport) &&
      getAirportCode(selectedDestinationAirport)
  );

  function handleTripTypeChange(event) {
    const selectedTripType = event.target.value;

    setTripType(selectedTripType);

    if (selectedTripType === "one-way") {
      setReturnDate("");
      setErrors((currentErrors) => ({
        ...currentErrors,
        returnDate: "",
      }));
    }
  }

  function handleSwapCities() {
    setOrigin(destination);
    setDestination(origin);
    setSelectedOriginAirport(selectedDestinationAirport);
    setSelectedDestinationAirport(selectedOriginAirport);
    setErrors({});
    setApiError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const submittedOrigin = origin.trim();
    const submittedDestination = destination.trim();
    const departure = departureDate;
    const submittedReturnDate = returnDate;
    const submittedPassengers = passengers;
    const cabinClass = formData.get("cabinClass");
    const airline = formData.get("airline");
    const submittedMaxPrice = maxPrice.trim();
    const directFlights =
      formData.get("directFlights") === "on";

    const newErrors = {};

    if (!submittedOrigin) {
      newErrors.origin = "Please enter a departure city.";
    }

    if (!submittedDestination) {
      newErrors.destination = "Please enter a destination city.";
    }

    if (!departure) {
      newErrors.departure =
        "Please select a departure date.";
    }

    if (sameCity) {
      newErrors.destination =
        "Your destination must be different from your departure city.";
    }

    if (
      tripType === "round-trip" &&
      departure &&
      submittedReturnDate &&
      submittedReturnDate < departure
    ) {
      newErrors.returnDate =
        "The return date cannot be earlier than the departure date.";
    }

    if (
      submittedMaxPrice &&
      Number(submittedMaxPrice) <= 0
    ) {
      newErrors.maxPrice =
        "Maximum price must be greater than zero.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSearchSummary(null);
      setSelectedFlight(null);
      clearComparison();
      setFlights([]);
      setApiError("");
      return;
    }

    setIsLoading(true);
    setSearchSummary(null);
    setSelectedFlight(null);
    clearComparison();
    setSortBy("cheapest");
    setFlights([]);
    setApiError("");

    const backendAirline =
      airline === "all" ? undefined : formatOption(airline);

    const originCode = getAirportCode(selectedOriginAirport);
    const destinationCode = getAirportCode(
      selectedDestinationAirport
    );
    const canSearchLive = Boolean(
      originCode && destinationCode && departure
    );

    try {
      const response = canSearchLive
        ? await searchLiveFlights({
            originCode,
            destinationCode,
            departureDate: departure,
            adults: Number(submittedPassengers) || 1,
            airline: backendAirline,
            directOnly: directFlights,
            maxPrice: submittedMaxPrice
              ? Number(submittedMaxPrice)
              : undefined,
            sortBy: "price_asc",
          })
        : await searchFlights({
            origin: submittedOrigin,
            destination: submittedDestination,
            airline: backendAirline,
            directOnly: directFlights,
            maxPrice: submittedMaxPrice
              ? Number(submittedMaxPrice)
              : undefined,
            sortBy: "price_asc",
          });

      setFlights(response.flights);

      setSearchSummary({
        origin: response.origin,
        destination: response.destination,
        originCode,
        destinationCode,
        departure,
        returnDate: submittedReturnDate,
        passengers: submittedPassengers,
        cabinClass,
        airline,
        directFlights,
        maxPrice: submittedMaxPrice,
        tripType,
        isLive: canSearchLive,
      });

      addSearch({
        origin: response.origin,
        destination: response.destination,
        departure,
      });

    } catch (error) {
      console.error("Flight search failed:", error);

      setApiError(
        error.message ||
          "We could not retrieve flights. Make sure the RouteWise backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSortChange(event) {
    const selectedSort = event.target.value;

    setSortBy(selectedSort);
    setSelectedFlight(null);

    if (!searchSummary) {
      return;
    }

    if (selectedSort === "fewest-stops") {
      return;
    }

    const backendSortOptions = {
      cheapest: "price_asc",
      fastest: "duration_asc",
      "highest-rated": "rating_desc",
    };

    const backendAirline =
      searchSummary.airline === "all"
        ? undefined
        : formatOption(searchSummary.airline);

    setIsLoading(true);
    setApiError("");

    try {
      const response = searchSummary.isLive
        ? await searchLiveFlights({
            originCode: searchSummary.originCode,
            destinationCode: searchSummary.destinationCode,
            departureDate: searchSummary.departure,
            adults: Number(searchSummary.passengers) || 1,
            airline: backendAirline,
            directOnly: searchSummary.directFlights,
            maxPrice: searchSummary.maxPrice
              ? Number(searchSummary.maxPrice)
              : undefined,
            sortBy: backendSortOptions[selectedSort],
          })
        : await searchFlights({
            origin: searchSummary.origin,
            destination: searchSummary.destination,
            airline: backendAirline,
            directOnly: searchSummary.directFlights,
            maxPrice: searchSummary.maxPrice
              ? Number(searchSummary.maxPrice)
              : undefined,
            sortBy: backendSortOptions[selectedSort],
          });

      setFlights(response.flights);
    } catch (error) {
      console.error("Flight sorting failed:", error);

      setApiError(
        error.message ||
          "We could not update the flight results. Make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function formatOption(value) {
    return value
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  function formatCity(value) {
    return value
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatDate(date) {
    if (!date) {
      return "Not selected";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-CA", {
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
    const sortedFlights = [...flights];

    if (sortBy === "fewest-stops") {
      sortedFlights.sort(
        (firstFlight, secondFlight) =>
          firstFlight.stops - secondFlight.stops ||
          firstFlight.price - secondFlight.price
      );
    }

    return sortedFlights;
  }, [flights, sortBy]);

  const flightInsights = useMemo(() => {
    if (visibleFlights.length === 0) {
      return null;
    }

    const cheapest = visibleFlights.reduce(
      (bestFlight, currentFlight) =>
        currentFlight.price < bestFlight.price
          ? currentFlight
          : bestFlight
    );

    const fastest = visibleFlights.reduce(
      (bestFlight, currentFlight) =>
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

  const bestValueFlightId = useMemo(() => {
    if (visibleFlights.length === 0) {
      return null;
    }

    const prices = visibleFlights.map(
      (flight) => flight.price
    );
    const durations = visibleFlights.map(
      (flight) => flight.durationMinutes
    );
    const ratings = visibleFlights.map(
      (flight) => flight.rating
    );
    const stops = visibleFlights.map(
      (flight) => flight.stops
    );

    const minPrice = Math.min(...prices);
    const maxPriceValue = Math.max(...prices);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const minStops = Math.min(...stops);
    const maxStops = Math.max(...stops);

    function normalizeLowerIsBetter(
      value,
      minimum,
      maximum
    ) {
      if (maximum === minimum) {
        return 1;
      }

      return 1 - (value - minimum) / (maximum - minimum);
    }

    function normalizeHigherIsBetter(
      value,
      minimum,
      maximum
    ) {
      if (maximum === minimum) {
        return 1;
      }

      return (value - minimum) / (maximum - minimum);
    }

    const scoredFlights = visibleFlights.map(
      (flight) => {
        const priceScore = normalizeLowerIsBetter(
          flight.price,
          minPrice,
          maxPriceValue
        );

        const durationScore = normalizeLowerIsBetter(
          flight.durationMinutes,
          minDuration,
          maxDuration
        );

        const stopsScore = normalizeLowerIsBetter(
          flight.stops,
          minStops,
          maxStops
        );

        const ratingScore = normalizeHigherIsBetter(
          flight.rating,
          minRating,
          maxRating
        );

        const score =
          priceScore * 0.4 +
          durationScore * 0.25 +
          stopsScore * 0.2 +
          ratingScore * 0.15;

        return {
          id: flight.id,
          score,
        };
      }
    );

    scoredFlights.sort(
      (firstFlight, secondFlight) =>
        secondFlight.score - firstFlight.score
    );

    return scoredFlights[0].id;
  }, [visibleFlights]);

  function buildRoute(flight) {
    return `${formatCity(
      flight.origin
    )} → ${formatCity(flight.destination)}`;
  }

  function handleRecentSearch(search) {
    setOrigin(search.origin);
    setDestination(search.destination);
    setDepartureDate(search.departure);
    setSelectedOriginAirport(null);
    setSelectedDestinationAirport(null);
  }

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">
          Flight Intelligence Platform
        </p>

        <h1>Find a flight that fits your trip.</h1>

        <p className="subtitle">
          Search and compare flights by price, duration,
          airline, and number of stops.
        </p>
      </header>

      <section className="search-card">
        <form
          className="search-form"
          onSubmit={handleSubmit}
          noValidate
        >
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
              <AirportAutocomplete
                id="origin"
                label="From"
                value={origin}
                placeholder="City, airport or code"
                onChange={setOrigin}
                onAirportSelect={setSelectedOriginAirport}
                hasError={Boolean(errors.origin)}
              />

              {errors.origin && (
                <p
                  className="error-message"
                  id="origin-error"
                >
                  {errors.origin}
                </p>
              )}
            </div>

            <div className="form-group">
              <AirportAutocomplete
                id="destination"
                label="To"
                value={destination}
                placeholder="City, airport or code"
                onChange={setDestination}
                onAirportSelect={
                  setSelectedDestinationAirport
                }
                hasError={
                  Boolean(errors.destination) ||
                  sameCity
                }
              />

              {(errors.destination || sameCity) && (
                <p
                  className="error-message"
                  id="destination-error"
                >
                  {sameCity
                    ? "Your destination must be different from your departure city."
                    : errors.destination}
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
              <label htmlFor="departure">
                Departure
              </label>

              <input
                id="departure"
                name="departure"
                type="date"
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                value={departureDate}
                onChange={(event) =>
                  setDepartureDate(event.target.value)
                }
                aria-invalid={Boolean(
                  errors.departure
                )}
                aria-describedby={
                  errors.departure
                    ? "departure-error"
                    : undefined
                }
              />

              {errors.departure && (
                <p
                  className="error-message"
                  id="departure-error"
                >
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
                min={
                  departureDate ||
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                value={returnDate}
                onChange={(event) =>
                  setReturnDate(event.target.value)
                }
                disabled={tripType === "one-way"}
                aria-invalid={Boolean(
                  errors.returnDate
                )}
                aria-describedby={
                  errors.returnDate
                    ? "return-error"
                    : undefined
                }
              />

              {errors.returnDate && (
                <p
                  className="error-message"
                  id="return-error"
                >
                  {errors.returnDate}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passengers">
                Passengers
              </label>

              <input
                id="passengers"
                name="passengers"
                type="number"
                min="1"
                max="9"
                value={passengers}
                onChange={(event) =>
                  setPassengers(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxPrice">
                Maximum price (CAD)
              </label>

              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="1"
                step="1"
                placeholder="Example: 500"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
                aria-invalid={Boolean(
                  errors.maxPrice
                )}
                aria-describedby={
                  errors.maxPrice
                    ? "max-price-error"
                    : undefined
                }
              />

              {errors.maxPrice && (
                <p
                  className="error-message"
                  id="max-price-error"
                >
                  {errors.maxPrice}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cabinClass">
                Cabin class
              </label>

              <select
                id="cabinClass"
                name="cabinClass"
                defaultValue="economy"
              >
                <option value="economy">
                  Economy
                </option>
                <option value="premium-economy">
                  Premium economy
                </option>
                <option value="business">
                  Business
                </option>
                <option value="first">
                  First class
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="airline">
                Preferred airline
              </label>

              <select
                id="airline"
                name="airline"
                defaultValue="all"
              >
                <option value="all">
                  All airlines
                </option>
                <option value="air-canada">
                  Air Canada
                </option>
                <option value="westjet">
                  WestJet
                </option>
                <option value="porter-airlines">
                  Porter Airlines
                </option>
              </select>
            </div>

            <label
              className="checkbox-group"
              title={
                canSearchLiveHint
                  ? "All live results are already direct flights"
                  : undefined
              }
            >
              <input
                type="checkbox"
                name="directFlights"
                disabled={canSearchLiveHint}
              />
              Direct flights only
              {canSearchLiveHint && (
                <small style={{ marginLeft: "6px", opacity: 0.6 }}>
                  (live results are always direct)
                </small>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={sameCity || isLoading}
          >
            {isLoading
              ? "Searching..."
              : "Search Flights"}
          </button>
        </form>
      </section>

<RecentSearches
    recentSearches={recentSearches}
    onSelect={handleRecentSearch}
/>

<Favorites
  favorites={favorites}
  onRemove={removeFavorite}
  onClear={clearFavorites}
  formatPrice={formatPrice}
  formatDuration={formatDuration}
/>

<FlightComparison
  flights={comparedFlights}
  onRemove={removeComparedFlight}
  onClear={clearComparison}
  formatPrice={formatPrice}
  formatDuration={formatDuration}
  formatTime={formatTime}
/>

{isLoading && (


        <section
          className="loading-card"
          aria-live="polite"
        >
          <div className="spinner" />

          <h2>Searching for flights</h2>

          <p>
            Comparing routes from {formatCity(origin)}{" "}
            to {formatCity(destination)}...
          </p>
        </section>
      )}



      {apiError && !isLoading && (
        <section
          className="empty-results"
          aria-live="polite"
        >
          <h3>Flight search failed</h3>
          <p>{apiError}</p>
        </section>
      )}

      {searchSummary &&
        !isLoading &&
        !apiError && (
          <section
            className="results-section"
            aria-live="polite"
          >
            <div className="results-header">
              <div>
                <p className="results-eyebrow">
                  Available flights
                  {searchSummary.isLive
                    ? " · Live"
                    : " · Sample data"}
                </p>

                <h2>
                  {formatCity(
                    searchSummary.origin
                  )}{" "}
                  to{" "}
                  {formatCity(
                    searchSummary.destination
                  )}
                </h2>

                <p className="results-subtitle">
                  {formatDate(
                    searchSummary.departure
                  )}{" "}
                  · {searchSummary.passengers}{" "}
                  passenger
                  {Number(
                    searchSummary.passengers
                  ) > 1
                    ? "s"
                    : ""}{" "}
                  ·{" "}
                  {formatOption(
                    searchSummary.cabinClass
                  )}
                </p>
              </div>

              <div className="results-count">
                {visibleFlights.length} flight
                {visibleFlights.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            {flightInsights && (
              <div className="insights-grid">
                <article className="insight-card">
                  <span>Cheapest flight</span>

                  <strong>
                    {formatPrice(
                      flightInsights.cheapest.price
                    )}
                  </strong>

                  <p>
                    {
                      flightInsights.cheapest
                        .airline
                    }
                  </p>
                </article>

                <article className="insight-card">
                  <span>Fastest flight</span>

                  <strong>
                    {formatDuration(
                      flightInsights.fastest
                        .durationMinutes
                    )}
                  </strong>

                  <p>
                    {
                      flightInsights.fastest
                        .airline
                    }
                  </p>
                </article>

                <article className="insight-card">
                  <span>Best rated</span>

                  <strong>
                    ★{" "}
                    {
                      flightInsights.highestRated
                        .rating
                    }
                  </strong>

                  <p>
                    {
                      flightInsights.highestRated
                        .airline
                    }
                  </p>
                </article>

                <article className="insight-card">
                  <span>Flights found</span>

                  <strong>
                    {visibleFlights.length}
                  </strong>

                  <p>Matching your search</p>
                </article>
              </div>
            )}

            {visibleFlights.length > 0 && (
              <div className="results-toolbar">
                <div>
                  <h3>Compare flights</h3>

                  <p>
                    Select up to three flights, then compare
                    price, duration, stops, and rating. The
                    Best Value badge balances all four factors.
                  </p>
                </div>

                <div className="sort-group">
                  <label htmlFor="sortBy">
                    Sort by
                  </label>

                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="cheapest">
                      Cheapest
                    </option>

                    <option value="fastest">
                      Fastest
                    </option>

                    <option value="highest-rated">
                      Highest rated
                    </option>

                    <option
                      value="fewest-stops"
                      disabled={searchSummary?.isLive}
                    >
                      Fewest stops
                      {searchSummary?.isLive
                        ? " (N/A for live data)"
                        : ""}
                    </option>
                  </select>
                </div>
              </div>
            )}

            {visibleFlights.length > 0 ? (
              <div className="flight-list">
                {visibleFlights.map((flight) => (
                  <article
                    className="flight-card"
                    key={flight.id}
                  >
                    <div className="airline-section">
                      <div className="airline-logo">
                        {flight.airlineCode}
                      </div>

                      <div>
                        {flight.id === bestValueFlightId && (
                          <span className="best-value-badge">
                            Best Value
                          </span>
                        )}

                        <h3>{flight.airline}</h3>

                        <p>
                          {buildRoute(flight)}
                        </p>
                      </div>
                    </div>

                    <div className="flight-time">
                      <div>
                        <span>Departure</span>

                        <strong>
                          {formatTime(
                            flight.departureTime
                          )}
                        </strong>
                      </div>

                      <div className="route-line">
                        <span>
                          {formatDuration(
                            flight.durationMinutes
                          )}
                        </span>

                        <div className="line" />

                        <span>
                          {flight.stops} stop
                          {flight.stops !== 1 ? "s" : ""}
                          {flight.stops > 0 && flight.layoverAirport
                            ? ` (${flight.layoverAirport})`
                            : ""}
                        </span>
                      </div>

                      <div>
                        <span>Arrival</span>

                        <strong>
                          {formatTime(
                            flight.arrivalTime
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="flight-price">
                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite(flight.id)
                            ? "favorite-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavorite(flight)
                        }
                        aria-label={
                          isFavorite(flight.id)
                            ? `Remove ${flight.airline} flight from favorites`
                            : `Save ${flight.airline} flight to favorites`
                        }
                      >
                        {isFavorite(flight.id)
                          ? "♥ Saved"
                          : "♡ Save"}
                      </button>

                      <button
                        type="button"
                        className={`compare-button ${
                          isCompared(flight.id)
                            ? "compare-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleComparison(flight)
                        }
                        disabled={
                          !isCompared(flight.id) &&
                          comparedFlights.length >=
                            comparisonLimit
                        }
                        aria-label={
                          isCompared(flight.id)
                            ? `Remove ${flight.airline} flight from comparison`
                            : `Add ${flight.airline} flight to comparison`
                        }
                      >
                        {isCompared(flight.id)
                          ? "✓ Comparing"
                          : `Compare (${comparedFlights.length}/${comparisonLimit})`}
                      </button>

                      <div className="rating">
                        ★ {flight.rating}
                      </div>

                      <span>From</span>

                      <strong>
                        {formatPrice(flight.price)}
                      </strong>

                      <small>per passenger</small>

                      <button
                        type="button"
                        className="details-button"
                        onClick={() =>
                          setSelectedFlight(
                            selectedFlight ===
                              flight.id
                              ? null
                              : flight.id
                          )
                        }
                      >
                        {selectedFlight ===
                        flight.id
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>

                    {selectedFlight ===
                      flight.id && (
                      <div className="flight-details">
                        <div>
                          <span>Airline</span>

                          <strong>
                            {flight.airline}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Flight number
                          </span>

                          <strong>
                            {flight.flightNumber}
                          </strong>
                        </div>

                        <div>
                          <span>Trip type</span>

                          <strong>
                            {searchSummary.tripType ===
                            "round-trip"
                              ? "Round trip"
                              : "One way"}
                          </strong>
                        </div>

                        <div>
                          <span>Cabin</span>

                          <strong>
                            {formatOption(
                              searchSummary.cabinClass
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Stops</span>

                          <strong>
                            {flight.stops}
                            {flight.stops > 0 && flight.layoverAirport
                              ? ` via ${flight.layoverAirport}`
                              : ""}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Total duration
                          </span>

                          <strong>
                            {formatDuration(
                              flight.durationMinutes
                            )}
                          </strong>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <h3>
                  No matching flights found
                </h3>

                <p>
                  {searchSummary.isLive
                    ? "No scheduled flights were found on this exact route. This can happen for long-haul or less common routes with no direct service, or if there's simply nothing scheduled on this date. Try a busier route (e.g. major hub-to-hub) or a nearer date."
                    : "Try increasing your maximum price, selecting all airlines, or turning off direct flights only."}
                </p>
              </div>
            )}

            <p className="results-note">
              {searchSummary.isLive
                ? "Flight schedules and airlines are live from AviationStack. Prices shown are estimated for demo purposes, since fare data requires a separate paid provider."
                : "These results currently come from the RouteWise simulated flight database. Pick an airport suggestion from the dropdown to get live flight schedules."}
            </p>
          </section>
        )}
    </main>
  );
}

export default App;