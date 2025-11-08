import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import walletController from '../controllers/wallet.controller.js';

const router = express.Router();
router.use(authenticate);

// Wallet routes
router.get('/', walletController.getWallet);
router.get('/stats', walletController.getWalletStats);
router.get('/transactions', walletController.getTransactions);
router.get('/transactions/:id', walletController.getTransactionById);

// Add money to wallet
router.post('/add-money/create', walletController.createAddMoneyOrder);
router.post('/add-money/verify', walletController.verifyAddMoney);

// Withdraw from wallet
router.post('/withdraw', walletController.requestWithdrawal);

export default router;
