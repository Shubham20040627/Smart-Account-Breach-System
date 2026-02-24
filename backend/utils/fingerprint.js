const crypto = require('crypto');

exports.getFingerprint = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Extract simple OS/Browser info from user agent (case-insensitive detection)
    let os = 'Unknown OS';
    const ua = userAgent.toLowerCase();

    if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) os = 'iOS';
    else if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'Mac';
    else if (ua.includes('linux')) os = 'Linux';

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
