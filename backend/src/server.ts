import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { ENV } from './config/environment';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// API Base
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = parseInt(ENV.PORT, 10) || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Mess & Meal Management Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
