import { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseSummary from './components/ExpenseSummary';
import { getExpenses, getCategories, getExpenseSummary } from './api/expenses';

function App() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');

    // Fetch expenses with current filters
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getExpenses({
                category: selectedCategory,
                sort: sortOrder
            });

            setExpenses(result.expenses);
            setTotal(parseFloat(result.total));
        } catch (err) {
            setError('Failed to load expenses. Please try again.');
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, sortOrder]);

    // Fetch categories for filter dropdown
    const fetchCategories = async () => {
        try {
            const result = await getCategories();
            setCategories(result.categories);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Fetch summary by category
    const fetchSummary = async () => {
        try {
            const result = await getExpenseSummary();
            setSummary(result.summary);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchExpenses();
        fetchCategories();
        fetchSummary();
    }, [fetchExpenses]);

    // Handle new expense added
    const handleExpenseAdded = () => {
        fetchExpenses();
        fetchCategories();
        fetchSummary();
    };

    // Handle filter changes
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleSortChange = (sort) => {
        setSortOrder(sort);
    };

    return (
        <div className="app">
            <header className="header">
                <h1>💸 Expense Tracker</h1>
                <p>Track your spending and take control of your finances</p>
            </header>

            <div className="main-content">
                <aside>
                    <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                    <ExpenseSummary summary={summary} loading={loading} />
                </aside>

                <main>
                    <div className="card">
                        <div className="card-header">
                            <h2><span className="icon">📋</span> Expenses</h2>
                        </div>

                        <ExpenseFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                        />

                        <ExpenseList
                            expenses={expenses}
                            loading={loading}
                            error={error}
                            total={total}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
