import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// POST /api/auth/login { username/email, password }
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const identifier = username || email;
    if (!identifier || !password) return res.status(400).json({ error: 'username/email and password required' });

    const [rows] = await pool.query('SELECT id, name, email, role, status, join_date, password FROM users WHERE email=? OR name=? LIMIT 1', [identifier, identifier]);
    const user = rows?.[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Plaintext comparison for dev/demo
    if (String(user.password) !== String(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Issue a simple session-less response (no JWT for demo)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinDate: user.join_date,
      }
    });
  } catch (e) {
    console.error('Login error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (_req, res) => {
  // No server session yet; respond success for client to clear local state
  return res.status(204).end();
});

export default router;
