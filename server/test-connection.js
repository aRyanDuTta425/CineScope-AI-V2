const mongoose = require('mongoose');
const { MONGODB_URI } = require('./utils/config');

const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📍 Your public IP:', '183.83.158.49');
    console.log('🔗 Connection string:', MONGODB_URI ? 'Configured' : 'Missing');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📂 Database:', conn.connection.name);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Add IP address: 183.83.158.49');
      console.log('3. Or add 0.0.0.0/0 for development');
      console.log('4. Wait 1-2 minutes and try again');
    }
  }
};

testConnection();
