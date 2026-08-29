require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const casesRouter = require('./routes/cases');
const caseManagerRouter = require('./routes/caseManager');
const aiRouter = require('./routes/ai');
const adminRouter = require('./routes/admin');

// Seed utility
const seedDatabase = require('./utils/seedData');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARES
// ==========================================

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// JSON & URL-encoded body parser with increased limit for document uploads (base64)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// ROUTES
// ==========================================

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/case-manager', caseManagerRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// Fallback 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

// ==========================================
// START SERVER & DATABASE CONNECTION
// ==========================================

const startServer = async () => {
  // Connect to MongoDB Atlas
  const conn = await connectDB();

  if (conn) {
    // Auto seed if empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Initializing database with default records...');
        await seedDatabase();
      }
    } catch (err) {
      console.warn('Seeding check notice:', err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`OutLawed Legal Aid Platform Server Running`);
    console.log(`Port: ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
    console.log(`Database: MongoDB Atlas (outlawed)`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use by another instance.`);
      console.error(`👉 To free it on Windows, run:\n   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      console.error('Server startup error:', err);
      process.exit(1);
    }
  });
};

startServer();
