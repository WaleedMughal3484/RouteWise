import { useEffect, useRef, useState } from "react";
import airports from "../data/airports";
import "./AirportAutocomplete.css";


function AirportAutocomplete({
  id,
  label,
  value,
  placeholder,
  onChange,
  onAirportSelect,
  hasError = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedValue = value.trim().toLowerCase();

  const matchingAirports = normalizedValue
    ? airports
        .filter((airport) => {
          const searchableText = [
            airport.city,
            airport.airport,
            airport.code,
            airport.country,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedValue);
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleInputChange(event) {
    const nextValue = event.target.value;

    onChange(nextValue);
    onAirportSelect(null);
    setIsOpen(nextValue.trim().length > 0);
  }

  function handleAirportSelection(airport) {
    onChange(airport.city);
    onAirportSelect(airport);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="airport-autocomplete" ref={containerRef}>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={() => {
          if (value.trim()) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className={hasError ? "airport-input input-error" : "airport-input"}
        autoComplete="off"
      />

      {isOpen && (
        <div className="airport-suggestions">
          {matchingAirports.length > 0 ? (
            matchingAirports.map((airport) => (
              <button
                type="button"
                className="airport-suggestion"
                key={airport.code}
                onClick={() => handleAirportSelection(airport)}
              >
                <span className="airport-code">{airport.code}</span>

                <span className="airport-details">
                  <strong>
                    {airport.city}, {airport.country}
                  </strong>

                  <small>{airport.airport}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="no-airport-results">
              No matching airports found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AirportAutocomplete;