import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/targets/user/:userId?month=&year=
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const month = req.query.month ? Number(req.query.month) : null;
    const year = req.query.year ? Number(req.query.year) : null;
    let sql = 'SELECT * FROM user_targets WHERE user_id=?';
    const params = [userId];
    if (month && year) { sql += ' AND month=? AND year=?'; params.push(month, year); }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/targets/user/:userId { month, year, leadTarget, salesTarget, revenueTarget, conversionTarget? }
router.post('/user/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { month, year, leadTarget = 0, salesTarget = 0, revenueTarget = 0, conversionTarget = null } = req.body || {};
    if (!month || !year) return res.status(400).json({ error: 'month and year required' });
    // Try with conversion_target column; fallback if column missing
    try {
      await pool.query(
        'INSERT INTO user_targets (user_id, month, year, lead_target, sales_target, revenue_target, conversion_target) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE lead_target=VALUES(lead_target), sales_target=VALUES(sales_target), revenue_target=VALUES(revenue_target), conversion_target=VALUES(conversion_target)'
        , [userId, month, year, leadTarget, salesTarget, revenueTarget, conversionTarget]
      );
    } catch (e) {
      await pool.query(
        'INSERT INTO user_targets (user_id, month, year, lead_target, sales_target, revenue_target) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE lead_target=VALUES(lead_target), sales_target=VALUES(sales_target), revenue_target=VALUES(revenue_target)'
        , [userId, month, year, leadTarget, salesTarget, revenueTarget]
      );
    }
    const [rows] = await pool.query('SELECT * FROM user_targets WHERE user_id=? AND month=? AND year=?', [userId, month, year]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Optional daily targets table and endpoints if exists
// CREATE TABLE IF NOT EXISTS user_daily_targets (id INT AUTO_INCREMENT, user_id INT, date DATE, lead_target INT DEFAULT 0, PRIMARY KEY(id), UNIQUE KEY uniq_user_date (user_id, date));

router.get('/daily/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const date = String(req.query.date || '');
    if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });
    const [rows] = await pool.query('SELECT * FROM user_daily_targets WHERE user_id=? AND date=?', [userId, date]);
    res.json(rows?.[0] || null);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/targets/daily/:userId { date, leadTarget, salesTarget?, revenueTarget?, conversionGoal? }
router.post('/daily/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { date, leadTarget = 0, salesTarget = 0, revenueTarget = 0, conversionGoal = null } = req.body || {};
    if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });
    // Try with extended columns; fallback if they don't exist
    try {
      await pool.query('INSERT INTO user_daily_targets (user_id, date, lead_target, sales_target, revenue_target, conversion_goal) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE lead_target=VALUES(lead_target), sales_target=VALUES(sales_target), revenue_target=VALUES(revenue_target), conversion_goal=VALUES(conversion_goal)', [userId, date, leadTarget, salesTarget, revenueTarget, conversionGoal]);
    } catch (e) {
      await pool.query('INSERT INTO user_daily_targets (user_id, date, lead_target) VALUES (?,?,?) ON DUPLICATE KEY UPDATE lead_target=VALUES(lead_target)', [userId, date, leadTarget]);
    }
    const [rows] = await pool.query('SELECT * FROM user_daily_targets WHERE user_id=? AND date=?', [userId, date]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
