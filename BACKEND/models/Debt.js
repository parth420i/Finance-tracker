const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // New fields
    title: {
        type: String,
        trim: true,
    },
    // Old field kept for backward compat
    name: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: ['loan', 'credit card', 'personal', 'mortgage', 'other'],
        default: 'loan',
    },
    principalAmount: {
        type: Number,
    },
    // Old field kept for backward compat
    amount: {
        type: Number,
    },
    remainingBalance: {
        type: Number,
    },
    // Old field kept for backward compat
    remainingAmount: {
        type: Number,
    },
    interestRate: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    // Old field kept for backward compat
    dueDate: {
        type: Date,
    },
    repayments: [
        {
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            note: { type: String }
        }
    ],
    status: {
        type: String,
        enum: ['active', 'paid'],
        default: 'active',
    },
    note: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
