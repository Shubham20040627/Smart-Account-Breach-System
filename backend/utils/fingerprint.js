const crypto = require('crypto');

exports.getFingerprint = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Extract simple OS/Browser info from user agent (more robust detection)
    const os = /Windows|Mac|Linux|Android|iOS/.exec(userAgent)?.[0] || 'Unknown OS';

    let browser = 'Unknown Browser';
    if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('OPR') || userAgent.includes('Opera')) browser = 'Opera';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    const data = `${userAgent}-${ip}`;
    const deviceId = crypto.createHash('md5').update(data).digest('hex');

    return {
        deviceId,
        browser,
        OS: os,
        IP: ip
    };
};
