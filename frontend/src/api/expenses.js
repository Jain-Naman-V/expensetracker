const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generate a unique idempotency key
export const generateIdempotencyKey = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new expense
export const createExpense = async (expenseData, idempotencyKey) => {
    const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...expenseData,
            idempotencyKey,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create expense');
    }

    return response.json();
};

// Fetch expenses with optional filters
export const getExpenses = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) {
        params.append('category', filters.category);
    }
    if (filters.sort) {
        params.append('sort', filters.sort);
    }

    const url = `${API_BASE}/expenses${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch expenses');
    }

    return response.json();
};

// Fetch unique categories
export const getCategories = async () => {
    const response = await fetch(`${API_BASE}/expenses/categories`);

    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    return response.json();
};

// Fetch expense summary by category
export const getExpenseSummary = async () => {
    const response = await fetch(`${API_BASE}/expenses/summary`);

    if (!response.ok) {
        throw new Error('Failed to fetch summary');
    }

    return response.json();
};
