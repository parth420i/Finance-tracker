const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Check your MONGO_URI in .env file`);
    console.error(`   Current URI starts with: ${process.env.MONGO_URI?.substring(0, 30)}...`);
    // Don't crash — keep server alive so user can diagnose
  }
};

module.exports = connectDB;
