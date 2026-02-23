const express = require('express');
const router = express.Router();
const {
    register, login, logout, logoutAllDevices,
    getSecurityStatus, revokeDeviceSession
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);
router.post('/revoke-device', protect, revokeDeviceSession);
router.get('/security-status', protect, getSecurityStatus);

module.exports = router;
