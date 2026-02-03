function ExpenseList({ expenses, loading, error, total }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                Loading expenses...
            </div>
        );
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="empty-state">
                <div className="icon">📝</div>
                <p>No expenses found. Add your first expense!</p>
            </div>
        );
    }

    return (
        <>
            <table className="expense-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(expense => (
                        <tr key={expense.id}>
                            <td className="date">{formatDate(expense.date)}</td>
                            <td><span className="category">{expense.category}</span></td>
                            <td className="description" title={expense.description}>
                                {expense.description || '-'}
                            </td>
                            <td className="amount">{formatAmount(expense.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="total-display">
                <span className="label">Total ({expenses.length} expenses)</span>
                <span className="value">{formatAmount(total)}</span>
            </div>
        </>
    );
}

export default ExpenseList;
