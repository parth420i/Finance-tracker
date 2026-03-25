const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// GET /api/budgets
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        let query = { userId: mongoose.Types.ObjectId.createFromHexString(userId) };

        // If range provided, find budgets that are active during that range
        if (startDate && endDate) {
            query.$or = [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ];
        }

        const budgets = await Budget.find(query).sort({ startDate: -1 }).lean();

        // Calculate spent for each budget within its OWN specific range
        const populatedBudgets = await Promise.all(budgets.map(async (budget) => {
            const spentAgg = await Transaction.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId.createFromHexString(userId),
                        category: budget.category,
                        type: 'expense',
                        date: { $gte: budget.startDate, $lte: budget.endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$amount' }
                    }
                }
            ]);

            const spent = spentAgg[0]?.totalSpent || 0;
            return {
                ...budget,
                spent,
                remaining: budget.limit - spent,
                percentageUsed: budget.limit > 0 ? (spent / budget.limit) * 100 : 0
            };
        }));

        res.json(populatedBudgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/budgets
router.post('/', protect, async (req, res) => {
    try {
        const { category, limit, startDate, endDate } = req.body;
        if (!category || !limit || !startDate || !endDate)
            return res.status(400).json({ message: 'Category, limit, startDate, and endDate are required' });

        const budget = await Budget.create({
            userId: req.user.id,
            category,
            limit,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });

        res.status(201).json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/budgets/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const { category, limit, startDate, endDate } = req.body;
        const update = {};
        if (category) update.category = category;
        if (limit) update.limit = Number(limit);
        if (startDate) update.startDate = new Date(startDate);
        if (endDate) update.endDate = new Date(endDate);

        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            update,
            { new: true, runValidators: true }
        );
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/budgets/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
