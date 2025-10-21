# Demo Verification System - Quick Start Guide

## 🚀 How to Test the Demo Project Verification System

### Prerequisites
- MongoDB running
- Backend server running on port 5000
- Frontend running on port 3011
- Admin account created (email: admin@vsconnecto.com, password: admin123)

---

## 1️⃣ Start Servers

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm run dev
```

---

## 2️⃣ Create Test Accounts

### Create a Provider Account:
1. Go to http://localhost:3011
2. Click "Register"
3. Choose "Service Provider"
4. Fill in details:
   - Name: John Doe
   - Email: provider@test.com
   - Password: test123
5. Complete profile (skip verification for now)

---

## 3️⃣ Test Freelancer Flow

### Step 1: Check Demo Status (Not Assigned)
1. Login as provider (provider@test.com / test123)
2. Go to Dashboard
3. See yellow warning: "Demo Project Not Assigned"
4. Try to apply for a job → Should be BLOCKED with error message

### Step 2: Admin Assigns Demo
1. Open new incognito/private window
2. Login as admin (admin@vsconnecto.com / admin123)
3. Click "Admin Panel" button (top right, red)
4. Click "Demo Projects" card
5. Click "+ Assign Demo" button
6. Fill in:
   - Freelancer Email: provider@test.com
   - Type: Technical
   - Title: "Build a Simple Landing Page"
   - Description: "Create a responsive landing page with HTML, CSS, and JavaScript. Include a header, hero section, features section, and footer. Host it on GitHub Pages or Netlify and submit the live link."
7. Click "Assign Demo"
8. ✅ Success toast appears

### Step 3: Provider Submits Demo
1. Switch back to provider window
2. Refresh Dashboard
3. Demo status card shows: "📋 Demo Project Status - ⏳ Pending"
4. See demo title and description
5. Fill submission form:
   - Link: https://github.com/username/landing-page
   - Or File: (optional)
6. Click "Submit Demo Project"
7. ✅ Status changes to "🔍 Under Review"

### Step 4: Admin Reviews Demo
1. Switch to admin window
2. Go to Admin Panel → Demo Projects
3. Click "Filter by Status" → "Under Review"
4. Find the submitted demo
5. Click "Review & Score"
6. Modal opens showing:
   - Demo title, description
   - Freelancer name
   - Submission link (clickable)
7. Enter Score: 75
8. Enter Comments: "Good work! Clean code and responsive design. Keep it up!"
9. Click "Submit Review"
10. ✅ Demo auto-verified (score ≥ 60)

### Step 5: Provider Sees Result
1. Switch to provider window
2. Refresh Dashboard
3. Demo status card shows: "✅ Demo Verified!"
4. Score: 75/100
5. Admin feedback displayed
6. Green success message: "✨ You can now apply for jobs!"

### Step 6: Apply for Jobs
1. Go to Jobs page
2. Click on any job → "Apply Now"
3. ✅ Application form loads (no blocking!)
4. Fill cover letter, budget, duration
5. Submit proposal successfully

---

## 4️⃣ Test Rejection Flow

### Step 1: Create Another Provider
1. Register new provider: provider2@test.com / test123

### Step 2: Admin Assigns Demo
1. Admin assigns demo to provider2@test.com
2. Type: Non-Technical
3. Title: "Cook a Traditional Dish"
4. Description: "Prepare a traditional dish, document the recipe, and submit photos/video of the cooking process."

### Step 3: Provider Submits Low-Quality Demo
1. Login as provider2
2. Submit demo with minimal link

### Step 4: Admin Rejects
1. Admin reviews demo
2. Enter Score: 45 (below 60)
3. Comments: "Incomplete submission. Please provide detailed recipe steps and better quality photos."
4. Submit Review
5. ✅ Demo auto-rejected (score < 60)

### Step 5: Provider Sees Rejection
1. Provider2 dashboard shows: "❌ Demo Rejected"
2. Score: 45/100
3. Admin feedback shown
4. Resubmission form appears

### Step 6: Provider Resubmits
1. Fill new submission link
2. Click "Resubmit Demo Project"
3. ✅ Status back to "Under Review"

### Step 7: Admin Approves Resubmission
1. Admin reviews again
2. Score: 70
3. Comments: "Much better! Good improvement."
4. ✅ Verified

---

## 5️⃣ Test Admin Features

### Dashboard Statistics
1. Go to Admin Panel → Demo Projects
2. Check stats cards:
   - Total Demos
   - Pending count
   - Under Review count
   - Verified count
   - Average Score

### Filtering
1. Filter by Status: "Verified" → See only verified demos
2. Filter by Type: "Technical" → See only technical demos
3. Combine filters

### Pagination
1. If >10 demos exist, test pagination
2. Click "Next" / "Previous"

### Delete Demo
1. Find any demo
2. Click "Delete" button
3. Confirm deletion
4. ✅ Demo removed
5. Provider's demoVerification status reset to "not_assigned"

---

## 6️⃣ Edge Cases to Test

### Test 1: Provider without Demo Tries to Apply
1. Create new provider (no demo assigned)
2. Try to apply for job
3. ✅ Should see: "Demo Project Verification Required"

### Test 2: Pending Demo Provider Tries to Apply
1. Provider with Pending demo (not submitted)
2. Try to apply for job
3. ✅ Should see: "Please complete and submit your demo first"

### Test 3: Under Review Provider Tries to Apply
1. Provider with Under Review demo
2. Try to apply for job
3. ✅ Should see: "Your demo is under review, please wait"

### Test 4: Multiple Resubmissions
1. Provider gets rejected multiple times
2. Each time, can resubmit
3. Resubmission count tracked in activity log

### Test 5: Activity Log
1. Check any demo in admin panel
2. Scroll to "Activity Log"
3. See all actions: Assigned, Submitted, Reviewed
4. Each with timestamp and details

---

## 7️⃣ API Testing (Optional)

### Using Postman/Thunder Client:

**Get My Demo (Provider):**
```
GET http://localhost:5000/api/demo/my-demo
Headers: Authorization: Bearer <provider_token>
```

**Submit Demo (Provider):**
```
POST http://localhost:5000/api/demo/submit
Headers: Authorization: Bearer <provider_token>
Body: {
  "submissionLink": "https://github.com/demo",
  "submissionFile": "demo.pdf"
}
```

**Get All Demos (Admin):**
```
GET http://localhost:5000/api/demo/all?status=Under Review&type=Technical
Headers: Authorization: Bearer <admin_token>
```

**Assign Demo (Admin):**
```
POST http://localhost:5000/api/demo/assign
Headers: Authorization: Bearer <admin_token>
Body: {
  "freelancerId": "user_id_here",
  "freelancerType": "Technical",
  "demoTitle": "Build React App",
  "description": "Create a todo app with React"
}
```

**Review Demo (Admin):**
```
PUT http://localhost:5000/api/demo/review/:demoId
Headers: Authorization: Bearer <admin_token>
Body: {
  "score": 80,
  "adminComments": "Excellent work!"
}
```

**Demo Stats (Admin):**
```
GET http://localhost:5000/api/demo/stats
Headers: Authorization: Bearer <admin_token>
```

---

## ✅ Success Criteria

The system is working correctly if:

1. ✅ Providers cannot apply for jobs without verified demo
2. ✅ Admin can assign demos to specific providers
3. ✅ Providers can submit demos with links/files
4. ✅ Admin can review and score demos
5. ✅ Score ≥ 60 auto-verifies, < 60 auto-rejects
6. ✅ Rejected providers can resubmit
7. ✅ Verified providers can apply for jobs
8. ✅ Dashboard shows correct demo status
9. ✅ Admin panel shows all demos with filters
10. ✅ Activity log tracks all actions
11. ✅ Statistics update in real-time

---

## 🐛 Troubleshooting

### Provider can apply for jobs without demo:
- Check if demo verification check is in ApplyJob.tsx
- Verify user object has demoVerification field

### Demo not showing in dashboard:
- Check if DemoStatusCard is imported in Dashboard.tsx
- Verify API endpoint /api/demo/my-demo works

### Admin can't assign demo:
- Check if user exists with provided email
- Verify user role is 'provider'
- Check backend logs for errors

### Score doesn't auto-verify/reject:
- Check demo.controller.js reviewDemo function
- Verify score comparison: score >= 60 ? 'Verified' : 'Rejected'

### Activity log not updating:
- Check if activityLog.push() is called in controller
- Verify demo.save() is called after adding log

---

## 📝 Notes

- Demo status in User model and DemoProject must stay in sync
- Admin can manually override status using "Update Status" (if implemented)
- Freelancers can only see their own demo
- Admin sees all demos across all freelancers
- Pagination defaults to 10 demos per page
- Statistics auto-refresh on data changes

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. Browser console for frontend errors
2. Terminal for backend errors
3. MongoDB connection
4. Authentication tokens
