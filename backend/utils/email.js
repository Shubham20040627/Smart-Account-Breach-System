const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Use Ethereal for testing or real SMTP if configured
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER || 'testuser',
                pass: process.env.EMAIL_PASS || 'testpass'
            }
        });

        const mailOptions = {
            from: 'Smart Security <security@smartbreach.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: `<div>${options.message}</div>`
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email sending failed:', error.message);
        // Do not throw error so registration/login doesn't fail
    }
};

module.exports = sendEmail;
