# ✈️ RouteWise

RouteWise is a full-stack Flight Intelligence Platform built with **React**, **Vite**, and **FastAPI**. It helps users search, compare, and explore flights through an intuitive interface with filtering, sorting, airport autocomplete, favorites, and flight comparison.

> **Note:** RouteWise currently uses a simulated flight database for demonstration purposes. The project is designed so that a live flight API can be integrated in the future.

---

# Features

- 🔍 Search flights by origin and destination
- ✈️ Airport autocomplete with airport names and IATA codes
- 📅 One-way and round-trip flight search
- 💲 Maximum price filter
- 🛫 Direct flights only filter
- 🏢 Preferred airline selection
- 💺 Cabin class selection
- 📊 Sort flights by:
  - Cheapest
  - Fastest
  - Highest Rated
  - Fewest Stops
- ⭐ Save favorite flights
- 🕒 Recent search history
- ⚖️ Compare up to 3 flights side-by-side
- 📈 Flight insights:
  - Cheapest flight
  - Fastest flight
  - Highest rated flight
  - Average flight price
- 📱 Responsive design for desktop and mobile
- 🔄 Swap departure and destination airports
- 📄 View detailed flight information
- 🚫 Friendly validation and error handling

---

# Tech Stack

## Frontend

- React
- Vite
- JavaScript (ES6)
- CSS3

## Backend

- Python
- FastAPI
- Uvicorn

## Data

- JSON-based mock flight database

---


---

# Running the Project

## Backend

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install fastapi uvicorn
```

Start the backend server:

```bash
python -m uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

# Example Search

Try searching:

```text
From: Halifax
To: Toronto
```

This route contains multiple flights in the sample database and demonstrates all filtering and comparison features.

---

# Current Features

- Airport autocomplete
- Flight search
- Search filters
- Flight sorting
- Flight comparison
- Favorite flights
- Recent searches
- Flight details
- Search validation
- Loading state
- Responsive layout

---

# Future Improvements

- Live worldwide flight API integration
- Real-time prices and availability
- Multi-city itinerary support
- Flight route map
- PDF itinerary export
- User authentication
- Booking integration

---

# Screenshots


Example:


---

# Author

**Waleed Mughal**

Bachelor of Computer Science (Co-op)

Dalhousie University

GitHub:
https://github.com/WaleedMughal3484