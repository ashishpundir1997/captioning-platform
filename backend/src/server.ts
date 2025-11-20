import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import uploadRoutes from './routes/upload';
import captionRoutes from './routes/captions';
import renderRoutes from './routes/render';

// Load environment variables - works for both dev (ts-node) and prod (node dist/)
const envPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../.env')  // dist/../../.env = project_root/.env
  : path.join(__dirname, '../.env');     // src/../.env = project_root/backend/.env
dotenv.config({ path: envPath });

const app = express();
const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api/render', renderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});

export default app;
