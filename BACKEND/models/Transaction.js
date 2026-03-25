const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive'],
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Type is required'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
