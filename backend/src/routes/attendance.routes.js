import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/attendance
router.post('/', async (req, res) => {
  try {
    const { employeeId, date, status } = req.body || {};
    if (!employeeId || !date || !status) return res.status(400).json({ error: 'employeeId, date, status required' });

    // Upsert by (employee_id, date)
    const [existing] = await pool.query('SELECT id FROM attendance WHERE employee_id=? AND date=? LIMIT 1', [employeeId, date]);
    if (existing.length) {
      await pool.query('UPDATE attendance SET status=? WHERE id=?', [status, existing[0].id]);
      const [rows] = await pool.query('SELECT * FROM attendance WHERE id=?', [existing[0].id]);
      return res.json(rows[0]);
    }
    const [r] = await pool.query('INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)', [employeeId, date, status]);
    const [rows] = await pool.query('SELECT * FROM attendance WHERE id=?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/attendance/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM attendance WHERE id=?', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
