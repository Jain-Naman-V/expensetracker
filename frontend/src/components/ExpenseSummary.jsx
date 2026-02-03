function ExpenseSummary({ summary, loading }) {
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading || !summary || summary.length === 0) {
        return null;
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
                <h2><span className="icon">📊</span> Spending by Category</h2>
            </div>
            <div className="summary-grid">
                {summary.map(item => (
                    <div key={item.category} className="summary-item">
                        <div className="category-name">{item.category}</div>
                        <div className="category-total">{formatAmount(item.total)}</div>
                        <div className="category-count">{item.count} expense{item.count !== 1 ? 's' : ''}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExpenseSummary;
