import { useState } from "react";

const MAX_COMPARISON_FLIGHTS = 3;

export default function useFlightComparison() {
  const [comparedFlights, setComparedFlights] = useState([]);

  function isCompared(flightId) {
    return comparedFlights.some(
      (flight) => flight.id === flightId
    );
  }

  function toggleComparison(flight) {
    setComparedFlights((currentFlights) => {
      const alreadySelected = currentFlights.some(
        (currentFlight) =>
          currentFlight.id === flight.id
      );

      if (alreadySelected) {
        return currentFlights.filter(
          (currentFlight) =>
            currentFlight.id !== flight.id
        );
      }

      if (currentFlights.length >= MAX_COMPARISON_FLIGHTS) {
        return currentFlights;
      }

      return [...currentFlights, flight];
    });
  }

  function removeComparedFlight(flightId) {
    setComparedFlights((currentFlights) =>
      currentFlights.filter(
        (flight) => flight.id !== flightId
      )
    );
  }

  function clearComparison() {
    setComparedFlights([]);
  }

  return {
    comparedFlights,
    isCompared,
    toggleComparison,
    removeComparedFlight,
    clearComparison,
    comparisonLimit: MAX_COMPARISON_FLIGHTS,
  };
}