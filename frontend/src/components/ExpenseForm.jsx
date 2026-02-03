import { useState, useRef } from 'react';
import { createExpense, generateIdempotencyKey } from '../api/expenses';

const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Personal Care',
    'Other'
];

function ExpenseForm({ onExpenseAdded }) {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Store idempotency key to prevent duplicate submissions
    const idempotencyKeyRef = useRef(generateIdempotencyKey());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid positive amount');
            return false;
        }
        if (!formData.category) {
            setError('Please select a category');
            return false;
        }
        if (!formData.date) {
            setError('Please select a date');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await createExpense({
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: formData.date
            }, idempotencyKeyRef.current);

            if (result.duplicate) {
                setSuccess('Expense already recorded (duplicate request handled)');
            } else {
                setSuccess('Expense added successfully!');
            }

            // Reset form and generate new idempotency key
            setFormData({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            idempotencyKeyRef.current = generateIdempotencyKey();

            // Notify parent to refresh list
            if (onExpenseAdded) {
                onExpenseAdded();
            }

        } catch (err) {
            setError(err.message || 'Failed to add expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2><span className="icon">💰</span> Add Expense</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="amount">Amount (₹)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description (optional)</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What was this expense for?"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Adding...
                        </>
                    ) : (
                        'Add Expense'
                    )}
                </button>
            </form>
        </div>
    );
}

export default ExpenseForm;
