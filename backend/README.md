# 🚀 VSConnectO Backend API

Complete backend API for VSConnectO Service Marketplace Platform using **Node.js, Express, and MongoDB**.

---

## 📋 **Table of Contents**

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [API Documentation](#api-documentation)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)

---

## ✨ **Features**

- ✅ **RESTful API** with Express.js
- ✅ **MongoDB Database** (Local)  - Database Name: **VSConnectO**
- ✅ **JWT Authentication** (Access & Refresh Tokens)
- ✅ **Role-Based Authorization** (Client, Provider, Admin)
- ✅ **Password Hashing** with bcrypt
- ✅ **Input Validation** with express-validator
- ✅ **CORS Enabled** for frontend integration
- ✅ **Error Handling** middleware
- ✅ **Mongoose Models** for all entities
- ✅ **File Upload** support with multer

---

## 🔧 **Prerequisites**

Before you begin, ensure you have the following installed:

### **1. Node.js** (v16 or higher)
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
```

### **2. MongoDB** (Local Installation)
```bash
# Check if MongoDB is installed
mongod --version

# If not installed:
# Windows: Download from https://www.mongodb.com/try/download/community
# Install MongoDB Community Server
# Make sure MongoDB is running as a service
```

### **3. MongoDB Compass** (Optional but recommended)
- Visual GUI for MongoDB
- Download from: https://www.mongodb.com/try/download/compass

---

## 📦 **Installation**

### **Step 1: Navigate to Backend Directory**
```bash
cd "a:\DT project\SIH 18 try\final 4\backend"
```

### **Step 2: Install Dependencies**
```bash
npm install
```

This will install all required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `multer` - File uploads
- `uuid` - Unique ID generation
- `nodemon` - Development server (auto-restart)

---

## 🗄️ **Database Setup**

### **Step 1: Start MongoDB Service**

**On Windows:**
```powershell
# MongoDB should start automatically if installed as a service
# Check if running:
Get-Service -Name MongoDB

# If not running, start it:
Start-Service -Name MongoDB

# Or use MongoDB bin directly:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### **Step 2: Create Database**

The database **VSConnectO** will be created automatically when the server starts and connects to MongoDB.

### **Step 3: Verify Connection (Optional)**

Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see the **VSConnectO** database after running the server

Using MongoDB Shell:
```bash
# Open MongoDB shell
mongosh

# List databases
show dbs

# Use VSConnectO database
use VSConnectO

# Show collections
show collections
```

---

## 🚀 **Running the Server**

### **Development Mode** (with auto-restart)
```bash
npm run dev
```

### **Production Mode**
```bash
npm start
```

### **Expected Output:**
```
✅ MongoDB Connected Successfully to VSConnectO Database
📊 Database: VSConnectO

🚀 Server is running on port 5000
🌐 API URL: http://localhost:5000
🔗 Frontend URL: http://localhost:3011
📝 Environment: development
```

---

## 📚 **API Documentation**

### **Base URL:**
```
http://localhost:5000/api
```

### **Health Check:**
```http
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "VSConnectO Backend API is running",
  "database": "Connected",
  "timestamp": "2025-10-19T..."
}
```

---

## 🔐 **Authentication Endpoints**

### **1. Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "client",
  "phone": "+91-9876543210",
  "city": "Mumbai",
  "area": "Andheri"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "client",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **2. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### **3. Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### **4. Update Password**
```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### **5. Refresh Token**
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "..."
}
```

---

## 👤 **User Endpoints**

### **1. Get Profile**
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### **2. Update Profile**
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "+91-9876543210",
  "city": "Delhi",
  "area": "Connaught Place",
  "bio": "Experienced professional...",
  "skills": ["Plumbing", "Electrical"],
  "profileCompleted": true
}
```

### **3. Get User by ID**
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### **4. Search Providers**
```http
GET /api/users/search-providers?category=Plumbing&city=Mumbai&minRating=4
Authorization: Bearer <token>
```

---

## 💼 **Job Endpoints**

### **1. Create Job** (Client only)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Need Plumber for Kitchen Repair",
  "description": "Looking for experienced plumber to fix kitchen sink and pipes...",
  "category": "Plumbing",
  "budget": 5000,
  "deadline": "2025-10-30T10:00:00.000Z",
  "location": {
    "city": "Mumbai",
    "area": "Andheri",
    "address": "123 Street Name"
  }
}
```

### **2. Get All Jobs**
```http
GET /api/jobs?category=Plumbing&status=open&page=1&limit=20
Authorization: Bearer <token>
```

### **3. Get Job by ID**
```http
GET /api/jobs/:id
Authorization: Bearer <token>
```

### **4. Get My Jobs**
```http
GET /api/jobs/my-jobs?status=open
Authorization: Bearer <token>
```

### **5. Update Job** (Client only - own jobs)
```http
PUT /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "budget": 6000,
  "status": "in_progress"
}
```

### **6. Delete Job** (Client only - own jobs)
```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

---

## 📁 **Project Structure**

```
backend/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                      # Environment variables
├── models/                   # Mongoose models
│   ├── User.model.js
│   ├── Job.model.js
│   ├── Proposal.model.js
│   ├── Order.model.js
│   ├── Message.model.js
│   ├── Wallet.model.js
│   └── Review.model.js
├── controllers/              # Route controllers
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── job.controller.js
├── routes/                   # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── job.routes.js
│   ├── proposal.routes.js
│   ├── order.routes.js
│   ├── message.routes.js
│   ├── wallet.routes.js
│   └── review.routes.js
├── middleware/               # Custom middleware
│   └── auth.middleware.js
└── uploads/                  # File uploads directory
```

---

## 🔑 **Environment Variables**

The `.env` file contains:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/VSConnectO

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_REFRESH_SECRET=your_refresh_token_secret_key_change_this_too_2024
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3011

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**⚠️ Important:** Change the JWT secrets in production!

---

## 🗃️ **Database Collections**

The following collections will be created in VSConnectO database:

1. **users** - User accounts (clients, providers, admins)
2. **jobs** - Job postings
3. **proposals** - Provider proposals for jobs
4. **orders** - Active orders/contracts
5. **messages** - Chat messages
6. **wallets** - User wallet balances
7. **transactions** - Financial transactions
8. **reviews** - Ratings and reviews

---

## 🧪 **Testing the API**

### **Using cURL:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"test123","role":"client"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### **Using Postman:**
1. Download Postman from https://www.postman.com/downloads/
2. Import the API endpoints
3. Set Authorization header: `Bearer <token>`

### **Using Thunder Client (VS Code Extension):**
1. Install Thunder Client extension in VS Code
2. Create new requests for each endpoint
3. Add Bearer token for protected routes

---

## 🔧 **Troubleshooting**

### **MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```powershell
Start-Service -Name MongoDB
```

### **Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000

### **JWT Token Expired:**
```
{
  "success": false,
  "message": "Token expired"
}
```
**Solution:** Use the refresh token endpoint to get a new access token

---

## 📝 **Next Steps**

1. ✅ Backend is running
2. ✅ MongoDB connected
3. ⏭️ Connect frontend to backend API
4. ⏭️ Test all endpoints
5. ⏭️ Implement remaining controller logic
6. ⏭️ Add more features (proposals, orders, messages, wallet)

---

## 🎯 **API Status**

**✅ Completed:**
- Authentication (Register, Login, Get Me, Update Password, Refresh Token)
- User Management (Profile, Update, Search Providers)
- Jobs (Create, Get All, Get by ID, My Jobs, Update, Delete)

**🚧 To Implement:**
- Proposal management (Create, Accept, Reject)
- Order management (Create, Update Status)
- Messaging system (Send, Receive, Mark as Read)
- Wallet & Transactions (Add Money, Withdraw, History)
- Reviews & Ratings (Create, Get Reviews)

---

## 📞 **Support**

If you encounter any issues:
1. Check MongoDB is running
2. Verify .env configuration
3. Check console logs for errors
4. Test with Postman/Thunder Client

---

## 🎉 **Backend is Ready!**

Your VSConnectO backend API is now running on:
- **API URL:** http://localhost:5000
- **Database:** VSConnectO (MongoDB Local)
- **Health Check:** http://localhost:5000/api/health

**Start building your frontend integration!** 🚀
