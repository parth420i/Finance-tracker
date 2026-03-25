const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

// Helper: calculate next date based on frequency
const calcNextDate = (fromDate, frequency) => {
    const d = new Date(fromDate);
    switch (frequency) {
        case 'weekly': d.setDate(d.getDate() + 7); break;
        case 'monthly': d.setMonth(d.getMonth() + 1); break;
        case 'quarterly': d.setMonth(d.getMonth() + 3); break;
        case 'annually': d.setFullYear(d.getFullYear() + 1); break;
    }
    return d;
};

// GET /api/subscriptions — also auto-generates due transactions
router.get('/', protect, async (req, res) => {
    try {
        const subs = await Subscription.find({ userId: req.user.id });
        const now = new Date();

        // Auto-generate transactions for active subscriptions that are past due
        for (const sub of subs) {
            if (sub.status !== 'active') continue;

            let nextDate = sub.nextDate ? new Date(sub.nextDate) : calcNextDate(sub.startDate, sub.frequency);

            while (nextDate <= now) {
                // Check if transaction already exists for this date+sub
                const exists = await Transaction.findOne({
                    userId: req.user.id,
                    category: sub.category,
                    amount: sub.amount,
                    type: 'expense',
                    note: `[Recurring] ${sub.name}`,
                    date: {
                        $gte: new Date(nextDate.toISOString().split('T')[0]),
                        $lt: new Date(new Date(nextDate).setDate(nextDate.getDate() + 1))
                    }
                });

                if (!exists) {
                    await Transaction.create({
                        userId: req.user.id,
                        amount: sub.amount,
                        type: 'expense',
                        category: sub.category,
                        date: nextDate,
                        note: `[Recurring] ${sub.name}`,
                    });
                }

                nextDate = calcNextDate(nextDate, sub.frequency);
            }

            // Update the nextDate on the subscription
            sub.nextDate = nextDate;
            await sub.save();
        }

        // Re-fetch to return updated data
        const updated = await Subscription.find({ userId: req.user.id });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/subscriptions — validated creation
router.post('/', protect, async (req, res) => {
    try {
        const { name, amount, category, frequency, startDate, note } = req.body;

        if (!name || !amount || !category) {
            return res.status(400).json({ message: 'Name, amount, and category are required' });
        }

        const start = startDate ? new Date(startDate) : new Date();
        const nextDate = calcNextDate(start, frequency || 'monthly');

        // Create the subscription
        const subscription = await Subscription.create({
            userId: req.user.id,
            name: name.trim(),
            amount: Math.abs(Number(amount)),
            category: category.trim(),
            frequency: frequency || 'monthly',
            startDate: start,
            nextDate,
            note: note ? note.trim() : '',
        });

        // Also create the first transaction immediately
        await Transaction.create({
            userId: req.user.id,
            amount: Math.abs(Number(amount)),
            type: 'expense',
            category: category.trim(),
            date: start,
            note: `[Recurring] ${name.trim()}`,
        });

        res.status(201).json(subscription);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/subscriptions/:id  — safe update (no userId override)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, amount, category, frequency, status, note } = req.body;
        const update = {};
        if (name) update.name = name.trim();
        if (amount) update.amount = Math.abs(Number(amount));
        if (category) update.category = category.trim();
        if (frequency) update.frequency = frequency;
        if (status) update.status = status;
        if (note !== undefined) update.note = note.trim();

        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            update,
            { new: true }
        );
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.json(subscription);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.json({ message: 'Subscription deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
