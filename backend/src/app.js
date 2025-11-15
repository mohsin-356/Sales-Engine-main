import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';

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

// Trust reverse proxy (Nginx) for correct protocol and IPs
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json());

// Robust CORS allowlist with optional wildcard domains via CORS_ORIGIN_EXTRA (e.g., .vercel.app)
const primaryOrigin = process.env.CORS_ORIGIN || '';
const extraOrigin = process.env.CORS_ORIGIN_EXTRA || '';
const allowlist = [
  ...primaryOrigin.split(',').map(s => s.trim()).filter(Boolean),
  ...extraOrigin.split(',').map(s => s.trim()).filter(Boolean),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server / curl
    const ok = allowlist.some((o) => {
      if (!o) return false;
      if (o.startsWith('.')) return origin.endsWith(o); // suffix match for wildcard-like domains
      return origin === o;
    });
    return callback(ok ? null : new Error('CORS blocked'), ok);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
