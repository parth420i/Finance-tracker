const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/transactions — with optional filters
router.get('/', protect, async (req, res) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 50 } = req.query;
        const query = { userId: req.user.id };

        if (type && ['income', 'expense'].includes(type)) query.type = type;
        if (category) query.category = { $regex: category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate + 'T23:59:59');
        }
        if (search) query.note = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

        const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
        const safePage = Math.max(Number(page) || 1, 1);

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);

        res.json({ transactions, total, page: safePage, pages: Math.ceil(total / safeLimit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/transactions
router.post('/', protect, async (req, res) => {
    try {
        const { amount, type, category, date, note } = req.body;
        if (!amount || !type || !category)
            return res.status(400).json({ message: 'Amount, type, and category are required' });
        if (!['income', 'expense'].includes(type))
            return res.status(400).json({ message: 'Type must be income or expense' });
        if (Number(amount) <= 0)
            return res.status(400).json({ message: 'Amount must be positive' });

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount: Math.abs(Number(amount)),
            type,
            category: category.trim(),
            date: date || new Date(),
            note: note ? note.trim() : '',
        });

        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/transactions/:id — safe update (never allows userId override)
router.put('/:id', protect, async (req, res) => {
    try {
        const { amount, type, category, date, note } = req.body;
        const update = {};
        if (amount) update.amount = Math.abs(Number(amount));
        if (type && ['income', 'expense'].includes(type)) update.type = type;
        if (category) update.category = category.trim();
        if (date) update.date = new Date(date);
        if (note !== undefined) update.note = note.trim();

        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            update,
            { new: true, runValidators: true }
        );
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
