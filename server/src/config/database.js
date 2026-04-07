import mongoose from 'mongoose';

export let isConnected = false;

export const connectDB = async () => {
  try {
    // Use local MongoDB by default for development
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina';
    
    // Set connection timeout to 10 seconds max
    await Promise.race([
      mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5s')), 5000)
      )
    ]);
    
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️  Running in offline mode with in-memory storage.');
  }
};

// Check current connection status
export const checkConnection = () => isConnected;
