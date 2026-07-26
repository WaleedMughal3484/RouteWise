import { useState } from "react";
import "./App.css";

function App() {
  const [tripType, setTripType] = useState("round-trip");

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
        <form className="search-form">
          <div className="trip-type-group">
            <label>
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={(event) => setTripType(event.target.value)}
              />
              Round trip
            </label>

            <label>
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={(event) => setTripType(event.target.value)}
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">To</label>
              <input
                id="destination"
                name="destination"
                type="text"
                placeholder="Lahore"
              />
            </div>

            <div className="form-group">
              <label htmlFor="departure">Departure</label>
              <input
                id="departure"
                name="departure"
                type="date"
              />
            </div>

            <div className="form-group">
              <label htmlFor="return">Return</label>
              <input
                id="return"
                name="return"
                type="date"
                disabled={tripType === "one-way"}
              />
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
              <select
                id="airline"
                name="airline"
                defaultValue="all"
              >
                <option value="all">All airlines</option>
                <option value="air-canada">Air Canada</option>
                <option value="qatar-airways">Qatar Airways</option>
                <option value="emirates">Emirates</option>
                <option value="turkish-airlines">Turkish Airlines</option>
                <option value="british-airways">British Airways</option>
              </select>
            </div>

            <label className="checkbox-group">
              <input
                type="checkbox"
                name="directFlights"
              />
              Direct flights only
            </label>
          </div>

          <button type="submit">Search Flights</button>
        </form>
      </section>
    </main>
  );
}

export default App;