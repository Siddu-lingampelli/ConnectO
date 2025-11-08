# 🚀 Payment System Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Razorpay Test Keys

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" (Free account)
3. After signup, go to **Settings → API Keys**
4. Click "Generate Test Keys"
5. Copy the **Key ID** (starts with `rzp_test_`)
6. Copy the **Key Secret**

### Step 2: Add Keys to Backend

Edit `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=optional_for_now
```

### Step 3: Add Key to Frontend

Create or edit `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Install Dependencies

Already done! ✅ (`razorpay` and `node-cron` installed)

### Step 5: Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

You should see:
```
✅ Razorpay initialized
⏰ Cron jobs initialized
```

---

## 🧪 Test the Payment System

### Test 1: Add Money to Wallet

1. Login to ConnectO
2. Navigate to Wallet page (create if not exists)
3. Click "Add Money"
4. Enter amount (e.g., ₹1000)
5. In Razorpay popup:
   - **Card**: `4111 1111 1111 1111`
   - **CVV**: `123`
   - **Expiry**: Any future date
   - **Name**: Your name
6. Click Pay
7. Check wallet balance increased ✅

### Test 2: Make Job Payment

1. Create a job (as client)
2. Provider submits proposal
3. Client accepts proposal → Creates order
4. Payment options shown:
   - Pay with Card (Razorpay)
   - Pay with Wallet
   - Combined (Wallet + Card)
5. Complete payment
6. Check order status = "paid" ✅
7. Check escrow created ✅

### Test 3: Release Payment

1. Provider marks work complete
2. Client reviews work
3. Client clicks "Release Payment"
4. Money moves from escrow → provider wallet ✅
5. Provider can withdraw to bank/UPI

---

## 📋 API Testing with Postman/Thunder Client

### 1. Get Wallet Balance

```http
GET http://localhost:5000/api/wallet
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "balance": 0,
    "totalEarned": 0,
    "totalSpent": 0,
    "pendingAmount": 0
  }
}
```

### 2. Create Payment Order

```http
POST http://localhost:5000/api/payment/create-order
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": "ORDER_ID_HERE",
  "amount": 1000,
  "paymentMethod": "razorpay"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "razorpayOrderId": "order_xxxx",
    "amount": 100000,
    "currency": "INR",
    "paymentId": "payment_db_id"
  }
}
```

### 3. Get Transaction History

```http
GET http://localhost:5000/api/wallet/transactions?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔍 Verify Everything Works

### Check 1: Server Logs

When you start backend, you should see:
```
✅ MongoDB Connected Successfully
✅ Razorpay initialized
🚀 Server is running on port 5000
⏰ Cron jobs initialized
✅ Payment cron jobs initialized
```

### Check 2: Database Collections

Check MongoDB, you should have these collections:
- `payments` - Payment records
- `escrows` - Escrow holdings
- `refunds` - Refund requests
- `payouts` - Withdrawal requests
- `wallets` - User wallets
- `transactions` - Transaction history

### Check 3: Frontend Razorpay Script

Open browser console on payment page, check:
```javascript
window.Razorpay // Should be defined
```

---

## 🎯 Common Test Scenarios

### Scenario 1: Full Payment Flow
```
Client posts job → Provider proposes → Client accepts → 
Payment via Razorpay → Escrow created → Work done → 
Client releases → Provider receives money ✅
```

### Scenario 2: Wallet Top-up Flow
```
User has ₹0 balance → Adds ₹5000 via card → 
Balance becomes ₹5000 → Uses wallet for job payment ✅
```

### Scenario 3: Combined Payment
```
Wallet has ₹2000 → Job costs ₹5000 → 
Uses ₹2000 from wallet + ₹3000 from card → 
Payment complete ✅
```

### Scenario 4: Refund Flow
```
Payment made → Work not satisfactory → 
Client requests refund → Admin approves → 
Money refunded to original payment method ✅
```

### Scenario 5: Auto-Release
```
Payment held in escrow → Work completed → 
3 days pass → Cron job auto-releases → 
Provider receives payment automatically ✅
```

---

## 🐛 Troubleshooting

### Problem: "Razorpay is not defined"

**Solution:**
- Check `VITE_RAZORPAY_KEY_ID` in frontend `.env`
- Clear browser cache
- Restart frontend server

### Problem: "Razorpay not configured" error

**Solution:**
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend `.env`
- Restart backend server
- Look for "✅ Razorpay initialized" in logs

### Problem: "Payment verification failed"

**Solution:**
- Key secret might be wrong
- Check exact key (no extra spaces)
- Make sure using TEST keys in development

### Problem: Escrow not auto-releasing

**Solution:**
- Check server logs for "🔄 Running auto-release escrow job"
- Verify cron is initialized: "⏰ Cron jobs initialized"
- Check `autoRelease.scheduledFor` date in escrow document

---

## 📊 Monitor Payment System

### Check Wallet Status
```javascript
// In MongoDB Compass or shell
db.wallets.find({}).pretty()
```

### Check Pending Escrows
```javascript
db.escrows.find({ status: 'held' }).pretty()
```

### Check Today's Transactions
```javascript
const today = new Date();
today.setHours(0,0,0,0);
db.transactions.find({ 
  createdAt: { $gte: today } 
}).pretty()
```

---

## ✅ Success Checklist

Before going to production:

- [ ] Razorpay test keys working
- [ ] Can add money to wallet
- [ ] Can make job payments
- [ ] Escrow creates correctly
- [ ] Can release payments
- [ ] Auto-release works
- [ ] Can request refunds
- [ ] Transaction history shows
- [ ] Wallet balance updates correctly
- [ ] Get Razorpay LIVE keys
- [ ] Update .env with live keys
- [ ] Test with real small amount
- [ ] Setup webhook URL
- [ ] Add SSL certificate
- [ ] Enable payment notifications

---

## 🎉 You're Ready!

The payment system is fully functional with:
- ✅ Razorpay integration (Cards, UPI, NetBanking)
- ✅ Digital Wallet system
- ✅ Escrow protection
- ✅ Auto-release mechanism
- ✅ Refund system
- ✅ Transaction history
- ✅ Withdrawal system

**Next**: Create UI components for wallet and payment flows!

---

## 📞 Need Help?

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/
