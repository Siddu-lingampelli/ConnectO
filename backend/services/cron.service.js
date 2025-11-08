import cron from 'node-cron';
import paymentService from './payment.service.js';

/**
 * Setup cron jobs for payment system
 */
export const setupPaymentCrons = () => {
  // Run auto-release check every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running auto-release escrow job...');
    try {
      const count = await paymentService.processAutoRelease();
      if (count > 0) {
        console.log(`✅ Auto-released ${count} escrow(s)`);
      }
    } catch (error) {
      console.error('❌ Auto-release job error:', error);
    }
  });

  console.log('✅ Payment cron jobs initialized');
};

export default { setupPaymentCrons };
