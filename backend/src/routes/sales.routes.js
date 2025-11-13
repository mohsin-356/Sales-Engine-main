import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/sales
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/sales
router.post('/', async (req, res) => {
  try {
    const { leadId = null, amount = 0, advanceAmount = 0, status = 'pending_review', salesRepId = null, deliveryDate = null, projectScope = null } = req.body || {};
    const [r] = await pool.query(
      'INSERT INTO sales (lead_id, amount, advance_amount, status, sales_rep_id, created_at, delivery_date, project_scope) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)',
      [leadId, amount, advanceAmount, status, salesRepId, deliveryDate, projectScope]
    );
    const id = r.insertId;
    const [rows] = await pool.query('SELECT * FROM sales WHERE id=?', [id]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/sales/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { leadId, amount, advanceAmount, status, salesRepId, deliveryDate, projectScope } = req.body || {};
    await pool.query(
      'UPDATE sales SET lead_id=COALESCE(?,lead_id), amount=COALESCE(?,amount), advance_amount=COALESCE(?,advance_amount), status=COALESCE(?,status), sales_rep_id=COALESCE(?,sales_rep_id), delivery_date=COALESCE(?,delivery_date), project_scope=COALESCE(?,project_scope) WHERE id=?',
      [leadId, amount, advanceAmount, status, salesRepId, deliveryDate, projectScope, id]
    );
    const [rows] = await pool.query('SELECT * FROM sales WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/sales/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sales WHERE id=?', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
