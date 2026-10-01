const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const deliver = async (user, otp, purpose = '2fa') => {
  const title = purpose === 'email_verification' 
    ? 'Email Verification' 
    : 'Two-Factor Authentication';
    
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4F46E5; text-align: center;">AegisCore ${title}</h2>
      <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
      <p style="font-size: 14px; color: #666;">If you did not request this, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: 'SMTP configuration is missing. Please set SMTP_USER and SMTP_PASS in your environment variables.' });
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AegisCore Security" <no-reply@aegiscore.com>',
      to: user.email,
      subject: `AegisCore - ${title} Code: ${otp}`,
      html: htmlContent,
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email. Please check your SMTP configuration.');
  }
};

const sendRoleUpdateEmail = async (user, requestedRole, status) => {
  const isApproved = status === 'approved';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: ${isApproved ? '#10B981' : '#EF4444'}; text-align: center;">AegisCore Access Request ${isApproved ? 'Approved' : 'Denied'}</h2>
      <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
      <p style="font-size: 16px; color: #333;">
        Your request for <strong>${requestedRole.toUpperCase()}</strong> access has been 
        <strong style="color: ${isApproved ? '#10B981' : '#EF4444'};">${status}</strong>.
      </p>
      ${isApproved ? '<p style="font-size: 16px; color: #333;">You can now log in to the system and access your new privileges.</p>' : ''}
      <p style="font-size: 14px; color: #666; margin-top: 20px;">Thank you for your commitment to AegisCore.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AegisCore Security" <no-reply@aegiscore.com>',
      to: user.email,
      subject: `AegisCore - Access Request ${isApproved ? 'Approved' : 'Denied'}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending role update email:', error);
  }
};

module.exports = { deliver, sendRoleUpdateEmail };
