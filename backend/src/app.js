import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import leadRoutes from './routes/leads.routes.js';
import saleRoutes from './routes/sales.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import commissionRoutes from './routes/commissions.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import targetsRoutes from './routes/targets.routes.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'sales-engine-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/targets', targetsRoutes);

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
