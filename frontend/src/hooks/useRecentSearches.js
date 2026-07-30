import { useEffect, useState } from "react";

const STORAGE_KEY = "routewise_recent_searches";

export default function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const storedSearches = localStorage.getItem(STORAGE_KEY);

            return storedSearches
                ? JSON.parse(storedSearches)
                : [];
        } catch (error) {
            console.error(
                "Could not load recent searches:",
                error
            );

            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(recentSearches)
            );
        } catch (error) {
            console.error(
                "Could not save recent searches:",
                error
            );
        }
    }, [recentSearches]);

    function addSearch(search) {
        setRecentSearches((currentSearches) => {
            const withoutDuplicate = currentSearches.filter(
                (item) =>
                    item.origin !== search.origin ||
                    item.destination !== search.destination ||
                    item.departure !== search.departure
            );

            return [search, ...withoutDuplicate].slice(0, 5);
        });
    }

    return {
        recentSearches,
        addSearch,
    };
}