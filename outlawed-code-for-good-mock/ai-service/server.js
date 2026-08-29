require('dotenv').config();

const cors = require('cors');
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use('/health', healthRouter);
app.use('/search', searchRouter);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`OutLawed AI service running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
