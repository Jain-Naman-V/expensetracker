function ExpenseFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    sortOrder,
    onSortChange
}) {
    return (
        <div className="filters">
            <div className="filter-group">
                <label htmlFor="category-filter">Category:</label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="sort-order">Sort by Date:</label>
                <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                </select>
            </div>
        </div>
    );
}

export default ExpenseFilters;
