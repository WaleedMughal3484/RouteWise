export default function RecentSearches({
    recentSearches,
    onSelect,
}) {
    if (!recentSearches || recentSearches.length === 0) {
        return null;
    }

    return (
        <section className="recent-searches">
            <h3>Recent Searches</h3>

            <div className="recent-search-list">
                {recentSearches.map((search, index) => (
                    <button
                        key={`${search.origin}-${search.destination}-${search.departure}-${index}`}
                        type="button"
                        className="recent-search-item"
                        onClick={() => onSelect(search)}
                    >
                        <strong>
                            {search.origin} → {search.destination}
                        </strong>

                        <span>{search.departure}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}