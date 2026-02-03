const express = require('express');
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /expenses - Create a new expense
router.post('/', async (req, res) => {
    try {
        const { amount, category, description, date, idempotencyKey } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }
        if (!category || category.trim() === '') {
            return res.status(400).json({ error: 'Category is required' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Generate idempotency key if not provided
        const key = idempotencyKey || uuidv4();

        // Check for existing expense with same idempotency key (handle retries)
        const existingExpense = await pool.query(
            'SELECT * FROM expenses WHERE idempotency_key = $1',
            [key]
        );

        if (existingExpense.rows.length > 0) {
            // Return existing expense (idempotent response)
            return res.status(200).json({
                expense: existingExpense.rows[0],
                duplicate: true
            });
        }

        // Create new expense
        const result = await pool.query(
            `INSERT INTO expenses (amount, category, description, date, idempotency_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [amount, category.trim(), description || '', date, key]
        );

        res.status(201).json({
            expense: result.rows[0],
            duplicate: false
        });

    } catch (error) {
        console.error('Error creating expense:', error);

        // Handle unique constraint violation (race condition on idempotency key)
        if (error.code === '23505') {
            const existingExpense = await pool.query(
                'SELECT * FROM expenses WHERE idempotency_key = $1',
                [req.body.idempotencyKey]
            );
            if (existingExpense.rows.length > 0) {
                return res.status(200).json({
                    expense: existingExpense.rows[0],
                    duplicate: true
                });
            }
        }

        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// GET /expenses - Get all expenses with optional filtering and sorting
router.get('/', async (req, res) => {
    try {
        const { category, sort } = req.query;

        let query = 'SELECT * FROM expenses';
        const params = [];
        const conditions = [];

        // Filter by category
        if (category && category.trim() !== '') {
            params.push(category.trim());
            conditions.push(`category = $${params.length}`);
        }

        // Build WHERE clause
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Sort by date (newest first is default or when sort=date_desc)
        if (sort === 'date_desc' || !sort) {
            query += ' ORDER BY date DESC, created_at DESC';
        } else if (sort === 'date_asc') {
            query += ' ORDER BY date ASC, created_at ASC';
        }

        const result = await pool.query(query, params);

        // Calculate total
        const total = result.rows.reduce((sum, expense) => {
            return sum + parseFloat(expense.amount);
        }, 0);

        res.json({
            expenses: result.rows,
            total: total.toFixed(2),
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// GET /expenses/categories - Get unique categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT category FROM expenses ORDER BY category'
        );
        res.json({
            categories: result.rows.map(row => row.category)
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /expenses/summary - Get summary by category
router.get('/summary', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `);
        res.json({
            summary: result.rows.map(row => ({
                category: row.category,
                count: parseInt(row.count),
                total: parseFloat(row.total).toFixed(2)
            }))
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

module.exports = router;
