# ✈️ RouteWise: Flight Intelligence Platform

RouteWise is a full-stack flight intelligence platform that allows users to search, compare, and analyze domestic and international flight routes. It provides an intuitive interface for exploring flights, filtering results, comparing options, and saving favorite itineraries. The application uses a FastAPI backend with a simulated flight database and a React frontend.

## Features

### Flight Search
Search flights by:

- Origin
- Destination
- Departure Date
- Return Date
- Trip Type (One-Way / Round Trip)

### Airport Autocomplete

- Search by city, airport name, or IATA code
- Supports domestic and international airports

### Flight Filters

- Maximum Price
- Preferred Airline
- Cabin Class
- Direct Flights Only

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
- Flight Details
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

## Data Storage

- JSON Flight Database

---

# Running the Project

## Backend

Navigate to the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
pip install fastapi uvicorn
```

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

Try the following routes:

```text
Halifax → Toronto
Toronto → London
Toronto → Tokyo
Halifax → Lahore
Dubai → Lahore
Vancouver → Tokyo
```

---

# Current Features

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

---