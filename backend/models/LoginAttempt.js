const mongoose = require('mongoose');

const LoginAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    IP: String,
    success: {
        type: Boolean,
        required: true
    },
    browser: String,
    OS: String
}, { timestamps: true });

module.exports = mongoose.model('LoginAttempt', LoginAttemptSchema);
