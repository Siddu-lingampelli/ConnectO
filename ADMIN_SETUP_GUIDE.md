# Admin User Setup Guide

## 🔐 Admin Account Information

### Default Admin Credentials:
- **Email**: `admin@vsconnecto.com`
- **Password**: `admin123`
- **Role**: `admin`

## 📍 Where to Find Admin

### Admin Features Location:

1. **Homepage Admin Button** (Top Right Corner)
   - Visit: `http://localhost:3011/` or your homepage
   - Look for red "Admin Panel" button in header
   - Only visible when logged in as admin

2. **Direct Admin Routes**:
   - Admin Dashboard: `http://localhost:3011/admin`
   - User Management: `http://localhost:3011/admin/users`
   - Verification Management: `http://localhost:3011/admin/verifications`

3. **Backend API Endpoints**:
   - Base URL: `http://localhost:5000/api/admin`
   - Dashboard Stats: `/api/admin/dashboard`
   - Users List: `/api/admin/users`
   - Verifications: `/api/admin/verifications/pending`

## 🚀 How to Create Admin User

### Option 1: Using the Admin Creation Script (Recommended)

1. **Navigate to backend directory**:
   ```bash
   cd "a:\DT project\SIH 18 try\final 4\backend"
   ```

2. **Run the admin creation script**:
   ```bash
   node scripts/createAdmin.js
   ```

3. **Expected Output**:
   ```
   ✅ Connected to MongoDB
   ✅ Admin user created successfully!
   
   📋 Admin Login Credentials:
   Email: admin@vsconnecto.com
   Password: admin123
   
   🔗 Access admin panel at: http://localhost:3011/admin
   
   ✅ Database connection closed
   ```

### Option 2: Manually via MongoDB

1. **Open MongoDB Compass or Mongo Shell**

2. **Connect to your database**: `VSConnectO`

3. **Find or create user in `users` collection**

4. **Update/Insert admin user**:
   ```javascript
   db.users.updateOne(
     { email: "admin@vsconnecto.com" },
     {
       $set: {
         fullName: "Admin User",
         email: "admin@vsconnecto.com",
         password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash "admin123"
         role: "admin",
         phone: "1234567890",
         city: "Mumbai",
         isActive: true,
         verification: {
           status: "verified"
         }
       }
     },
     { upsert: true }
   )
   ```

## 📝 How to Access Admin Panel

### Step-by-Step Login Process:

1. **Create Admin User** (if not already created):
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   - Should run on: `http://localhost:5000`

3. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   - Should run on: `http://localhost:3011`

4. **Login as Admin**:
   - Visit: `http://localhost:3011/login`
   - Enter email: `admin@vsconnecto.com`
   - Enter password: `admin123`
   - Click Login

5. **Access Admin Panel**:
   - **Method 1**: Click "Admin Panel" button in homepage header (red button, top right)
   - **Method 2**: Navigate directly to `http://localhost:3011/admin`

## 🎯 Admin Panel Features

### 1. **Admin Dashboard** (`/admin`)
- Platform overview and statistics
- Total users count
- Total jobs count
- Pending verifications count
- Revenue tracking
- Recent activity feed

### 2. **User Management** (`/admin/users`)
- View all clients and service providers
- Search and filter users
- View user details
- Update user status (active/inactive)
- Delete users
- View user verification status

### 3. **Verification Management** (`/admin/verifications`)
- View pending verification requests
- Review submitted documents
- Approve verifications
- Reject verifications with reason
- Track verification history

## 🔧 Troubleshooting

### Issue: "Admin button not visible on homepage"

**Solutions**:
1. Make sure you're logged in as admin
2. Check user role in database: `db.users.findOne({email: "admin@vsconnecto.com"})`
3. Clear browser cache and localStorage
4. Logout and login again

### Issue: "Cannot access /admin route"

**Solutions**:
1. Verify you're logged in as admin user
2. Check browser console for errors
3. Verify token is valid in localStorage
4. Check backend is running on port 5000

### Issue: "Admin user doesn't exist"

**Solutions**:
1. Run the create admin script: `node scripts/createAdmin.js`
2. Check database connection in .env file
3. Verify MongoDB is running
4. Check the script output for errors

### Issue: "Unauthorized access to admin routes"

**Solutions**:
1. Verify user role is 'admin' in database
2. Check authentication token in browser localStorage
3. Ensure backend auth middleware is working
4. Check browser Network tab for 401/403 errors

## 📊 Admin Database Schema

The admin user in database looks like:

```javascript
{
  _id: ObjectId("..."),
  fullName: "Admin User",
  email: "admin@vsconnecto.com",
  password: "$2a$10$...", // bcrypt hashed
  role: "admin",          // ⭐ Important: Must be 'admin'
  phone: "1234567890",
  city: "Mumbai",
  isActive: true,
  verification: {
    status: "verified"
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## 🔒 Security Best Practices

1. **Change Default Password**:
   - After first login, change 'admin123' to a strong password
   - Use password manager to store credentials

2. **Limit Admin Access**:
   - Only create admin accounts when necessary
   - Monitor admin activity logs
   - Use strong, unique passwords

3. **Regular Audits**:
   - Review admin actions periodically
   - Check for unauthorized access attempts
   - Monitor user management changes

## 📋 Quick Reference

| Item | Value |
|------|-------|
| **Admin Email** | admin@vsconnecto.com |
| **Default Password** | admin123 |
| **Homepage URL** | http://localhost:3011 |
| **Admin Dashboard** | http://localhost:3011/admin |
| **Backend API** | http://localhost:5000/api/admin |
| **Script Location** | backend/scripts/createAdmin.js |

## 🆘 Need Help?

If you encounter issues:

1. Check if both backend and frontend servers are running
2. Verify MongoDB connection
3. Run the create admin script again
4. Check browser console for errors
5. Review backend server logs
6. Ensure .env file has correct MONGODB_URI

## 📝 Command Summary

```bash
# Create admin user
cd backend
node scripts/createAdmin.js

# Start backend
cd backend
npm start

# Start frontend
cd frontend
npm run dev

# Access admin panel
# Visit: http://localhost:3011/login
# Login with: admin@vsconnecto.com / admin123
# Click "Admin Panel" button or go to: http://localhost:3011/admin
```

---

**Note**: Remember to change the default password after first login for security purposes!
