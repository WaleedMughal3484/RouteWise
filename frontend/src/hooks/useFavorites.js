import { useEffect, useState } from "react";

const STORAGE_KEY = "routewise_favorite_flights";

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavorites =
        localStorage.getItem(STORAGE_KEY);

      return storedFavorites
        ? JSON.parse(storedFavorites)
        : [];
    } catch (error) {
      console.error(
        "Could not load favorite flights:",
        error
      );

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error(
        "Could not save favorite flights:",
        error
      );
    }
  }, [favorites]);

  function isFavorite(flightId) {
    return favorites.some(
      (flight) => flight.id === flightId
    );
  }

  function toggleFavorite(flight) {
    setFavorites((currentFavorites) => {
      const alreadySaved = currentFavorites.some(
        (favorite) => favorite.id === flight.id
      );

      if (alreadySaved) {
        return currentFavorites.filter(
          (favorite) => favorite.id !== flight.id
        );
      }

      return [flight, ...currentFavorites];
    });
  }

  function removeFavorite(flightId) {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (flight) => flight.id !== flightId
      )
    );
  }

  function clearFavorites() {
    setFavorites([]);
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}