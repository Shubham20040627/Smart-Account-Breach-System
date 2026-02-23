const crypto = require('crypto');

exports.getFingerprint = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Extract simple OS/Browser info from user agent (basic regex)
    const os = /Windows|Mac|Linux|Android|iOS/.exec(userAgent)?.[0] || 'Unknown OS';
    const browser = /Chrome|Firefox|Safari|Edge|Opera/.exec(userAgent)?.[0] || 'Unknown Browser';

    const data = `${userAgent}-${ip}`;
    const deviceId = crypto.createHash('md5').update(data).digest('hex');

    return {
        deviceId,
        browser,
        os,
        ip
    };
};
