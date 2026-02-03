const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./db');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB on cold start
let dbInitialized = false;
const ensureDB = async () => {
    if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
    }
};

// Middleware - Allow all origins for deployment
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
    try {
        await ensureDB();
        next();
    } catch (error) {
        console.error('DB init error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Expense Tracker API',
        endpoints: {
            'GET /expenses': 'List expenses',
            'POST /expenses': 'Create expense',
            'GET /expenses/categories': 'List categories',
            'GET /expenses/summary': 'Spending summary'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/expenses', expenseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;
