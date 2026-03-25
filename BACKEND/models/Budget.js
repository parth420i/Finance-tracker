const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    limit: {
        type: Number,
        required: [true, 'Budget limit is required'],
        min: [1, 'Limit must be at least 1'],
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
