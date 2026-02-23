const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { getFingerprint } = require('../utils/fingerprint');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Check if account is locked
        if (user.accountStatus === 'LOCKED') {
            if (user.lockUntil && user.lockUntil > Date.now()) {
                const remaining = Math.round((user.lockUntil - Date.now()) / 60000);
                return res.status(403).json({
                    message: `Account is locked. Try again in ${remaining} minutes.`,
                    locked: true,
                    lockUntil: user.lockUntil
                });
            } else {
                // Unlock if time expired
                user.accountStatus = 'ACTIVE';
                user.lockUntil = null;
                user.failedLoginAttempts = [];
                await user.save();
            }
        }

        const isMatch = await user.comparePassword(password);
        const fingerprint = getFingerprint(req);

        if (!isMatch) {
            // 2. Handle Failed Attempt (Sliding Window)
            const now = new Date();
            user.failedLoginAttempts.push(now);

            // Filter attempts in last 2 minutes
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            const recentAttempts = user.failedLoginAttempts.filter(t => t > twoMinutesAgo);
            user.failedLoginAttempts = recentAttempts;

            await LoginAttempt.create({
                userId: user._id,
                success: false,
                IP: fingerprint.ip,
                browser: fingerprint.browser,
                OS: fingerprint.os
            });

            if (recentAttempts.length >= 5) {
                user.accountStatus = 'LOCKED';
                user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 mins

                await sendEmail({
                    email: user.email,
                    subject: 'Security Alert: Account Locked',
                    message: `Your account has been locked for 10 minutes due to 5 failed login attempts within 2 minutes.`
                });
            }

            await user.save();
            return res.status(401).json({
                message: 'Invalid credentials',
                attemptsRemaining: 5 - recentAttempts.length
            });
        }

        // 3. Successful Login
        const token = signToken(user._id);

        // 4. Device Detection
        const deviceIndex = user.trustedDevices.findIndex(d => d.deviceId === fingerprint.deviceId);
        if (deviceIndex === -1) {
            // New Device
            user.trustedDevices.push({
                ...fingerprint,
                verified: true
            });

            await sendEmail({
                email: user.email,
                subject: 'Security Alert: New Device Login',
                message: `A new login was detected on your account from ${fingerprint.browser} on ${fingerprint.os} (IP: ${fingerprint.ip}).`
            });
        } else {
            user.trustedDevices[deviceIndex].lastLogin = Date.now();
            user.trustedDevices[deviceIndex].IP = fingerprint.ip;
        }

        // 5. Session Management
        user.activeSessions.push(token);
        user.failedLoginAttempts = []; // Reset on success
        await user.save();

        await LoginAttempt.create({
            userId: user._id,
            success: true,
            IP: fingerprint.ip,
            browser: fingerprint.browser,
            OS: fingerprint.os
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                accountStatus: user.accountStatus
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.activeSessions = user.activeSessions.filter(t => t !== req.token);
        await user.save();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logoutAllDevices = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.activeSessions = []; // Invalidate all tokens
        await user.save();
        res.status(200).json({ message: 'Logged out from all devices' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSecurityStatus = async (req, res) => {
    try {
        const attempts = await LoginAttempt.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(10);
        res.status(200).json({
            accountStatus: req.user.accountStatus,
            trustedDevices: req.user.trustedDevices,
            loginHistory: attempts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
