import mongoose from 'mongoose';
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
  role: String,
  verification: {
    status: String,
    panCardUrl: String,
    aadharCardUrl: String,
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: mongoose.Schema.Types.ObjectId
  }
});

const User = mongoose.model('User', userSchema);

async function approveAllPendingVerifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with pending verification
    const pendingUsers = await User.find({
      'verification.status': 'pending'
    });

    console.log(`\n📋 Found ${pendingUsers.length} pending verification(s)\n`);

    if (pendingUsers.length === 0) {
      console.log('✅ No pending verifications to approve');
      return;
    }

    // Display pending users
    pendingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   PAN: ${user.verification?.panCardUrl || 'N/A'}`);
      console.log(`   Aadhar: ${user.verification?.aadharCardUrl || 'N/A'}`);
      console.log('');
    });

    // Approve all pending verifications
    const result = await User.updateMany(
      { 'verification.status': 'pending' },
      {
        $set: {
          'verification.status': 'verified',
          'verification.reviewedAt': new Date()
        }
      }
    );

    console.log(`\n✅ Successfully approved ${result.modifiedCount} verification(s)!`);
    console.log('\n🎉 Users can now post jobs!');
    
    // Show approved users
    console.log('\n📋 Approved Users:');
    pendingUsers.forEach((user) => {
      console.log(`✓ ${user.fullName} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
approveAllPendingVerifications();
