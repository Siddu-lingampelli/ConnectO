import { sendEmail, sendWelcomeEmail } from '../services/email.service.js';

// POST /api/email/test
export const sendTestEmail = async (req, res) => {
  try {
    const { to, template = 'welcome', data = {} } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Missing "to" email address' });
    }

    // Map simple template names to convenience functions when appropriate
    if (template === 'welcome') {
      const name = data.name || 'User';
      const role = data.role || 'client';
      const result = await sendWelcomeEmail(to, name, role);
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Failed to send test welcome email', error: result.error });
      }
      return res.status(200).json({ success: true, message: 'Test welcome email sent', result });
    }

    // Generic send for other templates
    const sendResult = await sendEmail(to, template, data);
    if (!sendResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send test email', error: sendResult.error });
    }

    res.status(200).json({ success: true, message: 'Test email sent', result: sendResult });
  } catch (error) {
    console.error('sendTestEmail error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export default {
  sendTestEmail,
};