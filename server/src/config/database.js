import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Use local MongoDB by default for development
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️  Running in offline mode. Database features will not work.');
    // Don't exit, allow the server to run without database
  }
};
