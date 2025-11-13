import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// POST /api/commissions/calc { saleId }
router.post('/calc', async (req, res) => {
  try {
    const { saleId } = req.body || {};
    if (!saleId) return res.status(400).json({ error: 'saleId required' });

    const [sales] = await pool.query('SELECT id, amount, sales_rep_id FROM sales WHERE id=?', [saleId]);
    const sale = sales?.[0];
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const commissionAmount = Number(sale.amount || 0) * 0.10;
    const [r] = await pool.query(
      'INSERT INTO commissions (sale_id, amount, sales_rep_id, calculated_at) VALUES (?, ?, ?, NOW())',
      [sale.id, commissionAmount, sale.sales_rep_id]
    );
    const [rows] = await pool.query('SELECT * FROM commissions WHERE id=?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/commissions?repId=...
router.get('/', async (req, res) => {
  try {
    const repId = req.query.repId || null;
    let sql = 'SELECT * FROM commissions';
    const params = [];
    if (repId) {
      sql += ' WHERE sales_rep_id=?';
      params.push(repId);
    }
    sql += ' ORDER BY calculated_at DESC, id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
