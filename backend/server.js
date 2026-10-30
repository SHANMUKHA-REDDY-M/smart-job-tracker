import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './db/connect.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'https://smart-job-tracker.vercel.app',
  'https://smart-job-tracker-msr1.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use(errorHandler);

connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((error) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
