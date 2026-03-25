const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // ── Totals ──────────────────────────────────────────────
        const [incomeAgg, expenseAgg] = await Promise.all([
            Transaction.aggregate([
                { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Transaction.aggregate([
                { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'expense' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        const totalIncome = incomeAgg[0]?.total || 0;
        const totalExpense = expenseAgg[0]?.total || 0;
        const balance = totalIncome - totalExpense;

        // ── Pie chart data (expense by category) ─────────────────
        const pieData = await Transaction.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'expense' } },
            { $group: { _id: '$category', value: { $sum: '$amount' } } },
            { $project: { name: '$_id', value: 1, _id: 0 } },
            { $sort: { value: -1 } },
        ]);

        // ── Bar chart — last 7 days income & expense ─────────────
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const barRaw = await Transaction.aggregate([
            {
                $match: {
                    userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
                    date: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, type: '$type' },
                    total: { $sum: '$amount' },
                },
            },
        ]);

        // Build 7-day array
        const barMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            barMap[key] = { date: key, income: 0, expense: 0 };
        }
        barRaw.forEach(({ _id, total }) => {
            if (barMap[_id.day]) barMap[_id.day][_id.type] = total;
        });
        const barData = Object.values(barMap);

        // ── Line chart — monthly balance trend (last 6 months) ───
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const lineRaw = await Transaction.aggregate([
            {
                $match: {
                    userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
                    date: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
                    total: { $sum: '$amount' },
                },
            },
        ]);

        const lineMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7);
            lineMap[key] = { month: key, balance: 0, income: 0, expense: 0 };
        }
        lineRaw.forEach(({ _id, total }) => {
            if (lineMap[_id.month]) lineMap[_id.month][_id.type] = total;
        });
        Object.values(lineMap).forEach((m) => {
            m.balance = m.income - m.expense;
        });
        const lineData = Object.values(lineMap);

        // ── Recent transactions ──────────────────────────────────
        const recentTransactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .limit(5);

        // ── Insights ─────────────────────────────────────────────
        const insights = [];

        // Week over week comparison
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - 6);
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setMilliseconds(-1);

        const [thisWeekExp, lastWeekExp] = await Promise.all([
            Transaction.aggregate([
                { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'expense', date: { $gte: thisWeekStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Transaction.aggregate([
                { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'expense', date: { $gte: lastWeekStart, $lte: lastWeekEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        const thisW = thisWeekExp[0]?.total || 0;
        const lastW = lastWeekExp[0]?.total || 0;
        if (lastW > 0) {
            const pct = (((thisW - lastW) / lastW) * 100).toFixed(1);
            const direction = pct >= 0 ? 'more' : 'less';
            insights.push(`You spent ${Math.abs(pct)}% ${direction} than last week.`);
        }

        // Top spending category this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const topCat = await Transaction.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), type: 'expense', date: { $gte: monthStart } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
        ]);
        if (topCat.length > 0) {
            insights.push(`Your highest spending category this month is "${topCat[0]._id}" ($${topCat[0].total.toFixed(2)}).`);
        }

        res.json({
            totalIncome,
            totalExpense,
            balance,
            pieData,
            barData,
            lineData,
            recentTransactions,
            insights,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
