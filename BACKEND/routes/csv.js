const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const { Readable } = require('stream');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/csv/import
router.post('/import', protect, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const results = [];
    const errors = [];

    const bufferStream = Readable.from(req.file.buffer.toString('utf-8'));

    bufferStream
        .pipe(csv())
        .on('data', (row) => {
            // Expected columns: date, amount, type, category, note
            const { date, amount, type, category, note } = row;
            const parsedAmount = parseFloat(amount);
            const parsedDate = date ? new Date(date) : new Date();

            if (!parsedAmount || isNaN(parsedAmount)) {
                errors.push(`Invalid amount: ${amount}`);
                return;
            }
            if (!['income', 'expense'].includes((type || '').toLowerCase())) {
                errors.push(`Invalid type: ${type}`);
                return;
            }
            if (!category) {
                errors.push(`Missing category`);
                return;
            }

            results.push({
                userId: req.user.id,
                amount: Math.abs(parsedAmount),
                type: type.toLowerCase(),
                category: category.trim(),
                date: isNaN(parsedDate) ? new Date() : parsedDate,
                note: note ? note.trim() : '',
            });
        })
        .on('end', async () => {
            try {
                if (results.length === 0) {
                    return res.status(400).json({ message: 'No valid rows found', errors });
                }
                const inserted = await Transaction.insertMany(results);
                const insertedIds = inserted.map((t) => t._id);
                res.json({
                    message: `${results.length} transaction(s) imported successfully.`,
                    imported: results.length,
                    insertedIds,
                    errors,
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ message: `CSV parse error: ${err.message}` });
        });
});

// DELETE /api/csv/rollback — remove previously imported transactions by IDs
router.delete('/rollback', protect, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No transaction IDs provided' });
        }
        const result = await Transaction.deleteMany({
            _id: { $in: ids },
            userId: req.user.id,
        });
        res.json({ message: `${result.deletedCount} transaction(s) removed.`, deleted: result.deletedCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/csv/export
router.get('/export', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions to export' });
        }

        const fields = ['date', 'amount', 'type', 'category', 'note'];
        const data = transactions.map((t) => ({
            date: t.date.toISOString().slice(0, 10),
            amount: t.amount,
            type: t.type,
            category: t.category,
            note: t.note || '',
        }));

        const parser = new Parser({ fields });
        const csvData = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        res.send(csvData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
