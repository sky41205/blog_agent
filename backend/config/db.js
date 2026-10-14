const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autonomous_blogger';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[MongoDB Notice] The platform will continue running. You can set MONGODB_URI in .env to a MongoDB Atlas cluster or start local mongod.`);
    isConnected = false;
    return null;
  }
};

const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'none',
    database: mongoose.connection.name || 'none'
  };
};

module.exports = { connectDB, getDBStatus };
