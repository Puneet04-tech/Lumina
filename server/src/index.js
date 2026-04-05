import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log('📁 Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Verify environment variables are loaded
console.log('🔑 Environment Variables Loaded:');
console.log('   ✓ GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 15)}...` : '❌ NOT SET');
console.log('   ✓ GEMINI_MODEL:', process.env.GEMINI_MODEL || '❌ NOT SET');
console.log('   ✓ PORT:', process.env.PORT || 5000);
console.log('   ✓ NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect Database
connectDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/export', exportRoutes);

// Error Handler (should be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${process.env.NODE_ENV} at http://localhost:${PORT}`);
});
