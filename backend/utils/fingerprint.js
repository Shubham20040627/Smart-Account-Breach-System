const crypto = require('crypto');

exports.getFingerprint = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Extract simple OS/Browser info from user agent (more robust detection)
    let os = 'Unknown OS';
    if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) os = 'iOS';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'Mac';
    else if (userAgent.includes('Linux')) os = 'Linux';

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
