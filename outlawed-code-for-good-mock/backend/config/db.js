const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.DATABASE_URL || 'mongodb+srv://syamzeus999_db_user:uH8MrSRVOMWJzjS4@cluster0.98jrdt5.mongodb.net/outlawed?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process immediately so server can still serve health check or fallback gracefully
    return null;
  }
};

module.exports = connectDB;
