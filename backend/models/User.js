const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'LOCKED'],
    default: 'ACTIVE'
  },
  lockUntil: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: [Date], // Sliding window timestamps
    default: []
  },
  trustedDevices: [{
    deviceId: String,
    browser: String,
    OS: String,
    IP: String,
    firstLogin: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true }
  }],
  activeSessions: [{
    token: String,
    deviceId: String
  }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to check password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
