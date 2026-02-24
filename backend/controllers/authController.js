const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const jwt = require('jsonwebtoken');
const { getFingerprint } = require('../utils/fingerprint');
const { getIO } = require('../utils/socket');
const { executeCPPDemo } = require('../utils/cppBridge');

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
                IP: fingerprint.IP,
                browser: fingerprint.browser,
                OS: fingerprint.OS
            });

            if (recentAttempts.length >= 5) {
                user.accountStatus = 'LOCKED';
                user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 mins
            }

            await user.save();

            // Emit Security Update
            try {
                const io = getIO();
                io.to(user._id.toString()).emit('SECURITY_UPDATE');
            } catch (err) { }

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
        } else {
            user.trustedDevices[deviceIndex].lastLogin = Date.now();
            user.trustedDevices[deviceIndex].IP = fingerprint.IP;
            user.trustedDevices[deviceIndex].browser = fingerprint.browser;
            user.trustedDevices[deviceIndex].OS = fingerprint.OS;
            user.markModified('trustedDevices');
        }

        // 5. Session Management (IP-based Rate Limiting/Circular Queue Logic)
        // Clean up old sessions first to get an accurate count
        user.activeSessions = user.activeSessions.filter(s => typeof s === 'object' && s.token);

        const activeIPs = [...new Set(user.activeSessions.map(s => s.IP))];
        const isNewIP = !activeIPs.includes(fingerprint.IP);

        if (isNewIP && activeIPs.length >= 3) {
            return res.status(403).json({
                message: 'Login blocked: You are already logged in from another network/location. Please logout there first.',
                limitReached: true
            });
        }

        user.activeSessions.push({
            token,
            deviceId: fingerprint.deviceId,
            IP: fingerprint.IP
        });
        user.failedLoginAttempts = []; // Reset on success
        await user.save();

        // Emit Security Update
        try {
            const io = getIO();
            io.to(user._id.toString()).emit('SECURITY_UPDATE');
            if (deviceIndex === -1) {
                io.to(user._id.toString()).emit('SECURITY_ALERT', 'New device detected. Check your dashboard.');
            }
        } catch (err) { }

        await LoginAttempt.create({
            userId: user._id,
            success: true,
            IP: fingerprint.IP,
            browser: fingerprint.browser,
            OS: fingerprint.OS
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
        user.activeSessions = user.activeSessions.filter(s => s.token !== req.token);
        await user.save();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.revokeDeviceSession = async (req, res) => {
    try {
        const { deviceId } = req.body;
        const user = await User.findById(req.user.id);

        // Find and remove all sessions for this deviceId
        user.activeSessions = user.activeSessions.filter(s => s.deviceId !== deviceId);
        await user.save();

        // Optional: Emit security update
        try {
            const io = getIO();
            io.to(user._id.toString()).emit('SECURITY_UPDATE');
        } catch (err) { }

        res.status(200).json({ message: 'Device access revoked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logoutAllDevices = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.activeSessions = []; // Invalidate all tokens
        await user.save();

        // Emit Logout All event via Socket
        try {
            const io = getIO();
            io.to(user._id.toString()).emit('LOGOUT_ALL');
        } catch (err) { }

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

exports.getCPPAudit = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const fingerprint = getFingerprint(req);

        const sessionCount = user ? user.activeSessions.length : 0;
        const failedCount = user ? user.failedLoginAttempts.length : 0;

        const result = await executeCPPDemo(
            fingerprint.deviceId,
            fingerprint.IP,
            sessionCount,
            failedCount
        );

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
