# MongoDB Manual Verification Approval Commands

## Option 1: Approve ALL Pending Verifications

Run this command in MongoDB shell or MongoDB Compass:

```javascript
db.users.updateMany(
  { "verification.status": "pending" },
  { 
    $set: { 
      "verification.status": "verified",
      "verification.reviewedAt": new Date()
    }
  }
)
```

## Option 2: Approve Specific User by Email

Replace `user@example.com` with the actual email:

```javascript
db.users.updateOne(
  { "email": "user@example.com" },
  { 
    $set: { 
      "verification.status": "verified",
      "verification.reviewedAt": new Date()
    }
  }
)
```

## Option 3: Find Pending Verifications First

Check who needs approval:

```javascript
db.users.find(
  { "verification.status": "pending" },
  { fullName: 1, email: 1, role: 1, "verification.status": 1 }
).pretty()
```

## Option 4: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017` (or your connection string)
3. Select database: `VSConnectO`
4. Select collection: `users`
5. Filter: `{ "verification.status": "pending" }`
6. For each document:
   - Click the document
   - Click "Edit Document"
   - Change `verification.status` from `"pending"` to `"verified"`
   - Add `verification.reviewedAt` with current date
   - Click "Update"

## Quick Node.js Script

If you want to run a quick script, use this command:

```bash
cd "a:\DT project\SIH 18 try\final 4\backend"
node scripts/approveVerification.js
```

## Verify the Changes

After approval, check if it worked:

```javascript
db.users.find(
  { "verification.status": "verified" },
  { fullName: 1, email: 1, "verification.status": 1 }
).pretty()
```

---

## What Happens After Approval?

1. User's `verification.status` changes from `"pending"` to `"verified"`
2. User can now access `/post-job` page
3. User won't see the verification banner anymore
4. User can create job postings

---

## Revert if Needed

To reject a verification:

```javascript
db.users.updateOne(
  { "email": "user@example.com" },
  { 
    $set: { 
      "verification.status": "rejected",
      "verification.rejectionReason": "Documents unclear",
      "verification.reviewedAt": new Date()
    }
  }
)
```
