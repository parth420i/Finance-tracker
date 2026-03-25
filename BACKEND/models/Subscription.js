const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'annually'],
        default: 'monthly',
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    nextDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled'],
        default: 'active',
    },
    note: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
