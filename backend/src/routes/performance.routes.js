import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/performance/kpis?range=daily|weekly|monthly
router.get('/kpis', async (req, res) => {
  try {
    const range = String(req.query.range || 'weekly');
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const from = req.query.from ? String(req.query.from) : null;
    const to = req.query.to ? String(req.query.to) : null;
    const where = [];
    const params = [];
    if (userId) { where.push('sales_rep_id = ?'); params.push(userId); }
    if (from) { where.push('DATE(created_at) >= ?'); params.push(from); }
    if (to) { where.push('DATE(created_at) <= ?'); params.push(to); }
    const sqlBase = `FROM sales ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
    const [agg] = await pool.query(`SELECT COUNT(*) AS totalSales, COALESCE(SUM(amount),0) AS revenue FROM sales ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`, params);
    const [ver] = await pool.query(`SELECT COUNT(*) AS verifiedCount, COALESCE(SUM(amount),0) AS verifiedRevenue ${sqlBase} ${where.length? ' AND':''} status IN ('verified','delivered')`, params);
    res.json({ range, userId, totalSales: Number(agg?.[0]?.totalSales||0), revenue: Number(agg?.[0]?.revenue||0), verifiedCount: Number(ver?.[0]?.verifiedCount||0), verifiedRevenue: Number(ver?.[0]?.verifiedRevenue||0) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/performance/series?range=daily|weekly|monthly
router.get('/series', async (req, res) => {
  try {
    const range = String(req.query.range || 'weekly');
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const from = req.query.from ? String(req.query.from) : null;
    const to = req.query.to ? String(req.query.to) : null;
    const where = [];
    const params = [];
    if (userId) { where.push('sales_rep_id = ?'); params.push(userId); }
    if (from) { where.push('DATE(created_at) >= ?'); params.push(from); }
    if (to) { where.push('DATE(created_at) <= ?'); params.push(to); }
    let dateWhere = '';
    if (!from && !to) {
      dateWhere = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
    const combined = [dateWhere, ...where].filter(Boolean).join(' AND ');
    const sql = `SELECT DATE(created_at) AS d, COUNT(*) AS cnt, COALESCE(SUM(amount),0) AS amount FROM sales ${combined? 'WHERE '+combined: ''} GROUP BY DATE(created_at) ORDER BY d ASC`;
    const [rows] = await pool.query(sql, params);
    res.json({ range, userId, points: rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
