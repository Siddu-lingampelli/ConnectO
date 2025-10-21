import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VSConnectO';

async function fixIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('jobs');

    // Get all indexes
    console.log('\n📊 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop all 2dsphere indexes
    console.log('\n🗑️  Dropping old geospatial indexes...');
    for (const index of indexes) {
      if (index.name.includes('2dsphere') || index.name.includes('coordinates')) {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`⚠️  Could not drop ${index.name}:`, error.message);
        }
      }
    }

    // Create the correct geospatial index
    console.log('\n🔨 Creating new geospatial index...');
    await collection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { name: 'location_coordinates_2dsphere' }
    );
    console.log('✅ Created index: location_coordinates_2dsphere');

    // Verify new indexes
    console.log('\n📊 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
