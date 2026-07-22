import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  city: String,
  isActive: Boolean,
  verification: {
    status: String
  }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@vsconnecto.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
    } else {
      // Create new admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = new User({
        fullName: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        city: 'Mumbai',
        isActive: true,
        verification: {
          status: 'verified'
        }
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log('Email: admin@vsconnecto.com');
    console.log('Password: ' + (process.env.ADMIN_PASSWORD || 'admin123'));
    console.log('\n⚠️  CHANGE THE DEFAULT PASSWORD IMMEDIATELY after first login.');
    console.log('\n🔗 Access admin panel at: http://localhost:3011/admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createAdminUser();
