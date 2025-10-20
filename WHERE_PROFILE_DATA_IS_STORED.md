# 📍 WHERE YOUR PROFILE DATA IS STORED

## 🗄️ **Main Storage Location: MongoDB Database**

### **Database Name:** `VSConnectO`
### **Collection Name:** `users`
### **Connection String:** `mongodb://localhost:27017/VSConnectO`

---

## 📊 **Storage Layers (3 Layers):**

```
┌──────────────────────────────────────────────────┐
│  Layer 1: MongoDB Database (PERMANENT)          │
│  Location: Local MongoDB server                  │
│  Port: 27017                                     │
│  Database: VSConnectO                            │
│  Collection: users                               │
│  ✅ Source of Truth                             │
└──────────────────────────────────────────────────┘
                    ↓ syncs to ↓
┌──────────────────────────────────────────────────┐
│  Layer 2: Redux Store (SESSION)                 │
│  Location: Browser memory (RAM)                  │
│  Lifespan: While page is open                    │
│  ⚡ Fast access during session                  │
└──────────────────────────────────────────────────┘
                    ↓ caches to ↓
┌──────────────────────────────────────────────────┐
│  Layer 3: localStorage (CACHE)                  │
│  Location: Browser disk storage                  │
│  Lifespan: Until manually cleared                │
│  ⚡ Survives page refresh                       │
└──────────────────────────────────────────────────┘
```

---

## 🗂️ **MongoDB Document Structure:**

### **Your Profile Data in MongoDB:**

```javascript
// Collection: users
// Document for each user:
{
  _id: ObjectId("68f5da48099498ea5618bdd0"),
  
  // Basic Info (from Step 1)
  fullName: "Lingampelli Siddhartha",
  email: "siddulingampelli480@gmail.com",
  password: "$2a$10$hashed_password...", // Encrypted
  phone: "9876543210",
  city: "Mumbai",
  area: "Andheri West",
  bio: "Professional service provider...",
  
  // Role & Status
  role: "provider", // or "client"
  profileCompleted: true,
  isActive: true,
  isEmailVerified: false,
  
  // Provider-Specific (from Steps 2-4)
  skills: ["Plumbing", "Pipe Fitting", "Leak Repair"],
  experience: "5",
  hourlyRate: 500,
  availability: "All Days",
  preferredCategories: ["Plumbing", "Electrical"],
  
  // Stats
  rating: 0,
  totalReviews: 0,
  completedJobs: 0,
  
  // Profile Picture
  profilePicture: "https://cloudinary.com/...",
  
  // Timestamps (auto-added by MongoDB)
  createdAt: ISODate("2025-01-20T10:30:00Z"),
  updatedAt: ISODate("2025-01-20T11:45:00Z"),
  lastLogin: ISODate("2025-01-20T11:45:00Z")
}
```

---

## 🔍 **How to View Your Data:**

### **Option 1: MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click database: `VSConnectO`
4. Click collection: `users`
5. See all user profiles

### **Option 2: MongoDB Shell (Terminal)**
```bash
# Connect to MongoDB
mongosh

# Switch to database
use VSConnectO

# Find all users
db.users.find().pretty()

# Find your specific user
db.users.findOne({ email: "siddulingampelli480@gmail.com" })

# Count total users
db.users.countDocuments()
```

### **Option 3: Backend API (Your App)**
```bash
# Get your profile
GET http://localhost:5000/api/user/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📂 **File System Locations:**

### **1. MongoDB Data Files:**
```
Windows: C:\Program Files\MongoDB\Server\7.0\data\
Linux: /var/lib/mongodb/
Mac: /usr/local/var/mongodb/

Inside:
VSConnectO/
├── users.bson          ← Your profile data
├── users.metadata.json
├── wallets.bson
└── jobs.bson
```

### **2. Browser localStorage:**
```javascript
// Location: Browser DevTools → Application → Local Storage
// Key: "user"
// Value: Cached copy of user object

localStorage.getItem('user');
// Returns: '{"id":"68f5...","fullName":"Lingampelli..."}'
```

### **3. Code Files:**

**Backend Model Definition:**
```
backend/models/User.model.js
```

**Backend Controller (Save Logic):**
```
backend/controllers/user.controller.js
  → updateProfile() function
```

**Backend Route:**
```
backend/routes/user.routes.js
  → PUT /api/users/profile
```

**Frontend Service:**
```
frontend/src/services/userService.ts
  → updateProfile() function
```

**Frontend Component:**
```
frontend/src/components/profile/ProfileCompletion.tsx
  → handleComplete() function
```

---

## 🔄 **Data Flow When You Click "Complete Profile":**

```
1. ProfileCompletion.tsx (Frontend)
   ↓
   User clicks "Complete Profile"
   ↓
   
2. userService.updateProfile() (Frontend)
   ↓
   HTTP PUT request to backend
   ↓
   
3. Express Route: PUT /api/users/profile (Backend)
   ↓
   Receives request, validates token
   ↓
   
4. user.controller.js → updateProfile() (Backend)
   ↓
   Processes data, calls MongoDB
   ↓
   
5. User.findByIdAndUpdate() (MongoDB)
   ↓
   SAVES TO DATABASE → users collection
   ↓
   
6. Response back to frontend
   ↓
   
7. Redux store updated (Frontend)
   ↓
   
8. localStorage updated (Frontend - cache)
```

---

## 📊 **Storage Comparison:**

| Storage | Location | Permanent? | Shareable? | Size Limit |
|---------|----------|------------|------------|------------|
| **MongoDB** | Server disk | ✅ Yes | ✅ Yes | ~100GB+ |
| **Redux** | Browser RAM | ❌ No (session) | ❌ No | ~10MB |
| **localStorage** | Browser disk | ⚠️ Until cleared | ❌ No | ~5-10MB |

---

## 🎯 **Key Points:**

1. **Primary Storage:** MongoDB database on your server
   - Location: `localhost:27017/VSConnectO/users`
   - Permanent and searchable

2. **Backend Controller:** `user.controller.js`
   - Function: `updateProfile()`
   - Saves to MongoDB using Mongoose

3. **Frontend Cache:** localStorage + Redux
   - Just for speed and offline access
   - Not the source of truth

4. **API Endpoint:** `PUT /api/users/profile`
   - This is what saves your profile
   - Protected by JWT authentication

---

## 📱 **Where Can You Access Your Data?**

✅ **From any device** - Data in MongoDB is accessible from:
- Your laptop
- Your phone
- Your tablet
- Different browsers
- Different locations

❌ **localStorage is local only** - Only accessible from:
- Same browser
- Same computer
- Gets deleted if you clear browser cache

---

## 🔐 **Security:**

### **MongoDB (Secure):**
- ✅ Password hashed with bcrypt
- ✅ JWT token authentication
- ✅ Server-side validation
- ✅ Protected API endpoints

### **localStorage (Less Secure):**
- ⚠️ User can view in DevTools
- ⚠️ XSS attacks can access it
- ⚠️ Only cache - no sensitive data

---

## 📝 **Summary:**

**When you complete your profile:**

1. ✅ Data sent to backend API
2. ✅ Backend saves to **MongoDB** (permanent)
3. ✅ MongoDB stores in **users collection**
4. ✅ Frontend caches in **localStorage** (temporary)
5. ✅ You can access from any device via MongoDB

**Your profile is permanently stored in MongoDB! 🎉**
