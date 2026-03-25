const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Debt = require('../models/Debt');

// GET /api/debts - Fetch loans with dynamic calculations
router.get('/', protect, async (req, res) => {
    try {
        const debts = await Debt.find({ userId: req.user.id }).lean();

        const updatedDebts = debts.map(debt => {
            // Handle both old and new field names
            const principal = debt.principalAmount || debt.amount || 0;
            const remaining = typeof debt.remainingBalance === 'number'
                ? debt.remainingBalance
                : (typeof debt.remainingAmount === 'number' ? debt.remainingAmount : principal);
            const rate = debt.interestRate || 0;
            const title = debt.title || debt.name || 'Untitled';

            // Monthly Interest = (remainingBalance × interestRate%) / 12
            const monthlyInterest = (remaining * (rate / 100)) / 12;

            // repaymentProgress = ((principal - remaining) / principal) × 100
            const repaymentProgress = principal > 0 ? ((principal - remaining) / principal) * 100 : 0;

            const totalRepaid = debt.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0;

            return {
                ...debt,
                title,
                principalAmount: principal,
                remainingBalance: remaining,
                monthlyInterest,
                repaymentProgress: Math.min(Math.max(repaymentProgress, 0), 100),
                totalRepaid
            };
        });

        res.json(updatedDebts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/debts - Create new loan
router.post('/', protect, async (req, res) => {
    try {
        const { principalAmount, title, interestRate, type, startDate, note } = req.body;

        if (!title || !principalAmount) {
            return res.status(400).json({ message: 'Title and Principal Amount are required' });
        }

        const debt = await Debt.create({
            userId: req.user.id,
            title,
            type: type || 'loan',
            principalAmount: Number(principalAmount),
            remainingBalance: Number(principalAmount),
            interestRate: Number(interestRate) || 0,
            startDate: startDate || new Date(),
            note,
            repayments: []
        });

        res.status(201).json(debt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/debts/repay - Record repayment and update balance
router.post('/repay', protect, async (req, res) => {
    try {
        const { loanId, amount, note, date } = req.body;

        if (!loanId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid Loan ID and Amount are required' });
        }

        const debt = await Debt.findOne({ _id: loanId, userId: req.user.id });

        if (!debt) {
            return res.status(404).json({ message: 'Loan/Debt not found' });
        }

        // Migrate old fields to new fields if needed
        if (!debt.title && debt.name) debt.title = debt.name;
        if (!debt.principalAmount && debt.amount) debt.principalAmount = debt.amount;
        if (typeof debt.remainingBalance !== 'number' || isNaN(debt.remainingBalance)) {
            debt.remainingBalance = debt.remainingAmount || debt.principalAmount || debt.amount || 0;
        }
        if (!debt.repayments) debt.repayments = [];

        // Update remaining balance
        debt.remainingBalance = Math.max(0, debt.remainingBalance - Number(amount));

        // Add to repayments array
        debt.repayments.push({
            amount: Number(amount),
            date: date || new Date(),
            note
        });

        // Auto-mark as paid if balance is 0
        if (debt.remainingBalance === 0) {
            debt.status = 'paid';
        }

        await debt.save();

        res.json({ message: 'Repayment successful', debt });
    } catch (err) {
        console.error('Repay error:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/debts/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const debt = await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!debt) return res.status(404).json({ message: 'Debt not found' });
        res.json({ message: 'Debt deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
