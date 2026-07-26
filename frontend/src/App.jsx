import "./App.css";

function App() {
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
          <div className="form-group">
            <label htmlFor="origin">From</label>
            <input
              id="origin"
              type="text"
              placeholder="Singapore"
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">To</label>
            <input
              id="destination"
              type="text"
              placeholder="Sydney"
            />
          </div>

          <div className="form-group">
            <label htmlFor="departure">Departure</label>
            <input
              id="departure"
              type="date"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passengers">Passengers</label>
            <input
              id="passengers"
              type="number"
              min="1"
              defaultValue="1"
            />
          </div>

          <button type="submit">Search Flights</button>
        </form>
      </section>
    </main>
  );
}

export default App;