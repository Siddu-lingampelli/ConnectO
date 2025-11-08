import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  // Support multiple email providers
  const emailProvider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

  if (emailProvider === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  if (emailProvider === 'smtp') {
    // Generic SMTP configuration
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = (process.env.SMTP_SECURE || 'false') === 'true';
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  if (emailProvider === 'resend') {
    // Resend SMTP support via their SMTP interface
    const port = process.env.RESEND_SMTP_PORT ? parseInt(process.env.RESEND_SMTP_PORT, 10) : 465;
    const secure = true;
    return nodemailer.createTransport({
      host: process.env.RESEND_SMTP_HOST || 'smtp.resend.com',
      port,
      secure,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // Default to Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  // Welcome Email Template
  welcome: (userName, userRole) => ({
    subject: '🎉 Welcome to ConnectO - Your Journey Starts Here!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F870F 0%, #0A5A0A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #0F870F; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
            .features { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
            .feature-box { flex: 1; min-width: 150px; padding: 15px; background: #F8FAFC; border-radius: 8px; text-align: center; }
            .emoji { font-size: 24px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to ConnectO!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">India's Premier Service Marketplace</p>
            </div>
            
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>We're thrilled to have you join ConnectO as a <strong>${userRole}</strong>! You've just taken the first step towards ${
      userRole === 'client' ? 'finding exceptional service providers' : 'growing your freelance career'
    }.</p>
              
              <div class="features">
                <div class="feature-box">
                  <div class="emoji">✅</div>
                  <strong>Verified Pros</strong>
                  <p style="font-size: 13px; color: #64748B; margin: 5px 0 0 0;">Work with trusted professionals</p>
                </div>
                <div class="feature-box">
                  <div class="emoji">🔒</div>
                  <strong>Secure Payments</strong>
                  <p style="font-size: 13px; color: #64748B; margin: 5px 0 0 0;">Protected transactions</p>
                </div>
                <div class="feature-box">
                  <div class="emoji">📍</div>
                  <strong>GPS Matching</strong>
                  <p style="font-size: 13px; color: #64748B; margin: 5px 0 0 0;">Find nearby services</p>
                </div>
              </div>

              ${
                userRole === 'provider'
                  ? `
              <h3>🚀 Next Steps for Providers:</h3>
              <ol style="line-height: 2;">
                <li><strong>Complete Your Profile:</strong> Add your skills, experience, and portfolio</li>
                <li><strong>Get Verified:</strong> Complete our demo project to unlock job applications</li>
                <li><strong>Start Bidding:</strong> Browse jobs and submit proposals</li>
                <li><strong>Build Reputation:</strong> Deliver quality work and earn reviews</li>
              </ol>
              `
                  : `
              <h3>🎯 Next Steps for Clients:</h3>
              <ol style="line-height: 2;">
                <li><strong>Post Your First Job:</strong> Describe what you need done</li>
                <li><strong>Review Proposals:</strong> Get bids from qualified providers</li>
                <li><strong>Choose the Best:</strong> Select based on reviews and expertise</li>
                <li><strong>Get It Done:</strong> Track progress and release payment</li>
              </ol>
              `
              }

              <center>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                  Go to Dashboard →
                </a>
              </center>

              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #F59E0B;">
                <strong>💡 Pro Tip:</strong> ${
                  userRole === 'provider'
                    ? 'Complete your profile 100% to get 3x more visibility!'
                    : 'Jobs with detailed descriptions get 5x more quality proposals!'
                }
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Connecting Skills with Opportunities</p>
              <p>Need help? Reply to this email or visit our Help Center</p>
              <p style="font-size: 12px; margin-top: 15px; color: #94A3B8;">
                This email was sent to you because you created an account on ConnectO.<br>
                If you didn't sign up, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Job Posted Notification
  jobPosted: (providerName, jobTitle, jobBudget, jobDescription, jobId) => ({
    subject: `🎯 New Job Alert: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F870F 0%, #0A5A0A 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .job-card { background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0F870F; margin: 20px 0; }
            .budget { font-size: 24px; color: #0F870F; font-weight: bold; }
            .button { display: inline-block; padding: 12px 30px; background: #0F870F; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💼 New Job Opportunity!</h1>
            </div>
            
            <div class="content">
              <p>Hi ${providerName},</p>
              <p>A new job matching your skills has been posted on ConnectO!</p>
              
              <div class="job-card">
                <h2 style="margin-top: 0; color: #0F870F;">${jobTitle}</h2>
                <p class="budget">₹${jobBudget.toLocaleString()}</p>
                <p style="margin: 15px 0;">${jobDescription.substring(0, 200)}${jobDescription.length > 200 ? '...' : ''}</p>
              </div>

              <p><strong>⚡ Act Fast:</strong> Early proposals get more attention!</p>

              <center>
                <a href="${process.env.FRONTEND_URL}/jobs/${jobId}" class="button">
                  View Job & Apply →
                </a>
              </center>

              <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>💡 Application Tips:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Personalize your proposal to the client's needs</li>
                  <li>Highlight relevant experience</li>
                  <li>Include work samples if applicable</li>
                  <li>Be competitive but fair with pricing</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Your Career, Your Way</p>
              <p style="font-size: 12px; margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL}/settings?tab=notifications" style="color: #0F870F;">Manage Email Preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Proposal Received (Client)
  proposalReceived: (clientName, providerName, jobTitle, proposalAmount, jobId) => ({
    subject: `📨 New Proposal for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F870F 0%, #0A5A0A 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #0F870F; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
            .highlight { background: #F0FDF4; padding: 15px; border-radius: 8px; border-left: 4px solid #0F870F; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 You Have a New Proposal!</h1>
            </div>
            
            <div class="content">
              <p>Hello ${clientName},</p>
              <p>Great news! A provider has submitted a proposal for your job "<strong>${jobTitle}</strong>".</p>
              
              <div class="highlight">
                <p><strong>Provider:</strong> ${providerName}</p>
                <p><strong>Proposed Amount:</strong> <span style="font-size: 20px; color: #0F870F; font-weight: bold;">₹${proposalAmount.toLocaleString()}</span></p>
              </div>

              <p style="margin-top: 20px;">Review their profile, check their ratings, and read their proposal to see if they're the right fit for your project.</p>

              <center>
                <a href="${process.env.FRONTEND_URL}/jobs/${jobId}/proposals" class="button">
                  View Proposal →
                </a>
              </center>

              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>✅ Before Hiring, Check:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Provider's rating and reviews</li>
                  <li>Portfolio and past work</li>
                  <li>Completion rate</li>
                  <li>Response time</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Finding the Perfect Match</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Order Started
  orderStarted: (userName, jobTitle, orderId, isProvider) => ({
    subject: `🚀 ${isProvider ? 'Work Started' : 'Order Confirmed'}: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F870F 0%, #0A5A0A 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #0F870F; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ${isProvider ? 'Let\'s Get Started!' : 'Order Confirmed!'}</h1>
            </div>
            
            <div class="content">
              <p>Hi ${userName},</p>
              <p>${
                isProvider
                  ? `Your proposal has been accepted! Time to showcase your skills on "<strong>${jobTitle}</strong>".`
                  : `Your order for "<strong>${jobTitle}</strong>" is now in progress!`
              }</p>

              ${
                isProvider
                  ? `
              <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0F870F;">📋 Provider Guidelines:</h3>
                <ul style="line-height: 1.8;">
                  <li>Communicate regularly with the client</li>
                  <li>Meet the agreed deadline</li>
                  <li>Deliver quality work</li>
                  <li>Ask questions if anything is unclear</li>
                  <li>Submit deliverables through the platform</li>
                </ul>
              </div>
              `
                  : `
              <div style="background: #DBEAFE; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0F870F;">👀 What to Expect:</h3>
                <ul style="line-height: 1.8;">
                  <li>The provider will start working on your project</li>
                  <li>You can track progress in real-time</li>
                  <li>Communicate via our messaging system</li>
                  <li>Review and approve deliverables</li>
                  <li>Payment is held securely until completion</li>
                </ul>
              </div>
              `
              }

              <center>
                <a href="${process.env.FRONTEND_URL}/orders/${orderId}" class="button">
                  View Order Details →
                </a>
              </center>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Making Work Happen</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Order Completed
  orderCompleted: (userName, jobTitle, orderId, isProvider) => ({
    subject: `✅ Order Completed: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Order Completed Successfully!</h1>
            </div>
            
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! The order for "<strong>${jobTitle}</strong>" has been marked as complete.</p>

              ${
                isProvider
                  ? `
              <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <h3 style="margin-top: 0;">🎉 Congratulations!</h3>
                <p>Your payment will be released once the client approves the delivery.</p>
                <p style="margin: 15px 0 0 0;"><strong>💰 Earnings:</strong> Visible in your wallet after client approval.</p>
              </div>
              `
                  : `
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                <h3 style="margin-top: 0;">⏳ Action Required</h3>
                <p>Please review the work and approve the delivery to release payment to the provider.</p>
              </div>
              `
              }

              <center>
                <a href="${process.env.FRONTEND_URL}/orders/${orderId}" class="button">
                  ${isProvider ? 'View Order' : 'Review & Approve'} →
                </a>
              </center>

              ${
                !isProvider
                  ? `
              <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>⭐ Don't Forget to Leave a Review!</strong>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Your feedback helps other clients and motivates providers.</p>
              </div>
              `
                  : ''
              }
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Jobs Done Right</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Password Reset
  passwordReset: (userName, resetToken) => ({
    subject: '🔐 Password Reset Request - ConnectO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
            .warning { background: #FEE2E2; padding: 15px; border-radius: 8px; border-left: 4px solid #EF4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your ConnectO account password.</p>
              
              <p>Click the button below to reset your password:</p>

              <center>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" class="button">
                  Reset Password →
                </a>
              </center>

              <p style="text-align: center; color: #64748B; font-size: 14px;">
                Or copy this link:<br>
                <code style="background: #F8FAFC; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                  ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
                </code>
              </p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                  <li>This link expires in 1 hour</li>
                  <li>If you didn't request this, ignore this email</li>
                  <li>Your password won't change unless you click the link</li>
                  <li>Never share this email with anyone</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Your Security Matters</p>
              <p style="font-size: 12px; margin-top: 10px; color: #94A3B8;">
                If you didn't request a password reset, please contact support immediately.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Email Verification
  emailVerification: (userName, verificationToken) => ({
    subject: '✉️ Verify Your Email - ConnectO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
            .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #64748B; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Your Email Address</h1>
            </div>
            
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thanks for signing up with ConnectO! Please verify your email address to activate your account.</p>

              <center>
                <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" class="button">
                  Verify Email Address →
                </a>
              </center>

              <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 20px;">
                This link expires in 24 hours.
              </p>

              <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>🔐 Why Verify?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                  <li>Secure your account</li>
                  <li>Unlock all platform features</li>
                  <li>Receive important notifications</li>
                  <li>Build trust with other users</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ConnectO</strong> - Secure & Trusted</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Main email sending function
export const sendEmail = async (to, templateName, templateData) => {
  try {
    // Basic configuration checks depending on provider
    const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();
    if (provider === 'gmail' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('⚠️ Gmail not configured. Would send:', templateName, 'to:', to);
      return { success: false, error: 'Gmail not configured' };
    }
    if (provider === 'smtp' && (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD)) {
      console.log('⚠️ SMTP not configured. Would send:', templateName, 'to:', to);
      return { success: false, error: 'SMTP not configured' };
    }
    if (provider === 'resend' && !process.env.RESEND_API_KEY) {
      console.log('⚠️ Resend API key not configured. Would send:', templateName, 'to:', to);
      return { success: false, error: 'Resend not configured' };
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName];

    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    const emailContent = template(...(Array.isArray(templateData) ? templateData : [templateData]));

    const mailOptions = {
      from: `ConnectO <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Convenience functions for each email type
export const sendWelcomeEmail = (email, userName, userRole) => {
  return sendEmail(email, 'welcome', [userName, userRole]);
};

export const sendJobNotification = (email, providerName, jobTitle, jobBudget, jobDescription, jobId) => {
  return sendEmail(email, 'jobPosted', [providerName, jobTitle, jobBudget, jobDescription, jobId]);
};

export const sendProposalNotification = (email, clientName, providerName, jobTitle, proposalAmount, jobId) => {
  return sendEmail(email, 'proposalReceived', [clientName, providerName, jobTitle, proposalAmount, jobId]);
};

export const sendOrderStartedEmail = (email, userName, jobTitle, orderId, isProvider) => {
  return sendEmail(email, 'orderStarted', [userName, jobTitle, orderId, isProvider]);
};

export const sendOrderCompletedEmail = (email, userName, jobTitle, orderId, isProvider) => {
  return sendEmail(email, 'orderCompleted', [userName, jobTitle, orderId, isProvider]);
};

export const sendPasswordResetEmail = (email, userName, resetToken) => {
  return sendEmail(email, 'passwordReset', [userName, resetToken]);
};

export const sendEmailVerification = (email, userName, verificationToken) => {
  return sendEmail(email, 'emailVerification', [userName, verificationToken]);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendJobNotification,
  sendProposalNotification,
  sendOrderStartedEmail,
  sendOrderCompletedEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
};
