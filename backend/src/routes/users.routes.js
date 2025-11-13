import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, status, join_date FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { name, email, role = 'sales_representative', status = 'active', joinDate, password = '' } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const [r] = await pool.query(
      'INSERT INTO users (name, email, role, status, join_date, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, role, status, joinDate || new Date(), password]
    );
    const id = r.insertId;
    const [rows] = await pool.query('SELECT id, name, email, role, status, join_date FROM users WHERE id=?', [id]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, joinDate, password } = req.body || {};
    await pool.query(
      'UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), role=COALESCE(?,role), status=COALESCE(?,status), join_date=COALESCE(?,join_date), password=COALESCE(?,password) WHERE id=?',
      [name, email, role, status, joinDate, password, id]
    );
    const [rows] = await pool.query('SELECT id, name, email, role, status, join_date FROM users WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id=?', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
