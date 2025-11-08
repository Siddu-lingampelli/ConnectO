import nodemailer from 'nodemailer';

// Email configuration
export const emailConfig = {
  // Email service provider (gmail, smtp, sendgrid, etc.)
  provider: process.env.EMAIL_PROVIDER || 'gmail',
  
  // Gmail configuration
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
    }
  },
  
  // Generic SMTP configuration (Mailgun, SendGrid SMTP, etc.)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  },
  
  // SendGrid API configuration (recommended for production)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  },
  
  // Default sender information
  from: {
    name: process.env.EMAIL_FROM_NAME || 'ConnectO',
    email: process.env.EMAIL_FROM || 'noreply@connecto.com'
  }
};

// Create transporter based on provider
export const createTransporter = () => {
  const provider = emailConfig.provider;
  
  switch (provider) {
    case 'gmail':
      return nodemailer.createTransporter(emailConfig.gmail);
    
    case 'smtp':
      return nodemailer.createTransporter(emailConfig.smtp);
    
    case 'sendgrid':
      // SendGrid requires @sendgrid/mail package for API method
      // For SMTP method, use smtp configuration
      return nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: emailConfig.sendgrid.apiKey
        }
      });
    
    default:
      console.warn(`⚠️  Unknown email provider: ${provider}, falling back to Gmail`);
      return nodemailer.createTransporter(emailConfig.gmail);
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('💡 Email features will be disabled. Please configure email settings in .env');
    return false;
  }
};

export default { emailConfig, createTransporter, verifyEmailConfig };
