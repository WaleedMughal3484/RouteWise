# ✈️ RouteWise: Flight Intelligence Platform

RouteWise is a full-stack flight intelligence platform that allows users to search, compare, and analyze domestic and international flight routes. It combines a curated simulated flight database with live flight schedule data from the AviationStack API, giving users a rich comparison experience with real-world flight data where available. The application uses a FastAPI backend and a React frontend.

## Features

### Flight Search
Search flights by:

- Origin
- Destination
- Departure Date
- Return Date
- Trip Type (One-Way / Round Trip)

### Live Flight Data

- Real flight schedules, airlines, and flight numbers pulled live from the AviationStack API
- Automatically triggered when both origin and destination are selected from the airport autocomplete dropdown
- Falls back to the simulated flight database when a route has no live coverage, when free-tier request limits are reached, or when airports are entered as free text instead of selected suggestions
- Prices and ratings on live results are clearly labeled as estimates, since AviationStack provides schedule data rather than fare data

### Airport Autocomplete

- Search by city, airport name, or IATA code
- Supports domestic and international airports

### Flight Filters

- Maximum Price
- Preferred Airline
- Cabin Class
- Direct Flights Only *(applies to simulated data; live results are always shown as direct, since AviationStack returns individual flight legs rather than connecting itineraries)*

### Flight Comparison

Compare up to three flights side-by-side based on:

- Price
- Duration
- Rating
- Number of Stops

### Flight Insights

The application automatically highlights:

- Cheapest Flight
- Fastest Flight
- Highest Rated Flight
- Average Flight Price
- Best Value Recommendation

### Additional Features

- Favorite Flights
- Recent Searches
- Flight Details (including layover airports on multi-stop simulated flights)
- Responsive Design
- Search Validation
- Friendly Error Handling
- Loading States
- Reset Search

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript (ES6)
- CSS3

## Backend

- Python
- FastAPI
- Uvicorn
- httpx (async HTTP client for live API requests)
- python-dotenv (environment variable management)

## Data Sources

- JSON simulated flight database (curated routes with full pricing, ratings, aircraft, and amenity details)
- AviationStack API (live real-world flight schedules)

---

# Running the Project

## Backend

Navigate to the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
pip install fastapi uvicorn httpx python-dotenv
```

Create a `.env` file in the `backend` folder with your AviationStack API key:

```text
AVIATIONSTACK_API_KEY=your_api_key_here
```

A free API key can be obtained at [aviationstack.com](https://aviationstack.com).

Run the backend server:

```bash
python -m uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Open a second terminal.

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# Example Searches

**Live data** — select these from the autocomplete dropdown for both origin and destination to see real scheduled flights:

```text
Toronto → New York
Toronto → Vancouver
London → Toronto
```

**Simulated data** — routes curated in the local database with full pricing and amenity details:

```text
Halifax → Toronto
Toronto → London
Toronto → Tokyo
Halifax → Lahore
Dubai → Lahore
Vancouver → Tokyo
```

Note: not every route will have live results. Uncommon or long-haul routes without direct scheduled service (e.g. Halifax → Dubai) will return no live results, since AviationStack only reports flights that actually exist.

---

# Current Features

- Live Flight Data (AviationStack API)
- Airport Autocomplete
- Flight Search
- Flight Filtering
- Flight Sorting
- Flight Comparison
- Best Value Recommendation
- Flight Insights
- Favorites
- Recent Searches
- Flight Details
- Responsive Interface
- Backend Validation
- Graceful Live/Simulated Data Fallback