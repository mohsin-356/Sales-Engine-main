import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/leads with optional filters: status, q, employeeId, from, to
router.get('/', async (req, res) => {
  try {
    const { status, q, employeeId, from, to } = req.query || {};
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(String(status)); }
    if (employeeId) { where.push('employee_id = ?'); params.push(Number(employeeId)); }
    if (from) { where.push('DATE(created_date) >= ?'); params.push(String(from)); }
    if (to) { where.push('DATE(created_date) <= ?'); params.push(String(to)); }
    if (q) {
      where.push('(client_name LIKE ? OR project_name LIKE ? OR phone LIKE ? OR address LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    const sql = `SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/leads
router.post('/', async (req, res) => {
  const { clientName, projectName, estimatedValue = 0, status = 'new', followUpDate = null, employeeId = null, phone = null, address = null, latestInfo = null, clientResponse = null, expectedCloseDate = null, source = null, priority = null, score = null, probability = null } = req.body || {};
  if (!clientName || !projectName) return res.status(400).json({ error: 'clientName and projectName required' });
  try {
    const [r] = await pool.query(
      'INSERT INTO leads (client_name, project_name, estimated_value, status, follow_up_date, employee_id, phone, address, latest_info, client_response, expected_close_date, source, priority, score, probability, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [clientName, projectName, estimatedValue, status, followUpDate, employeeId, phone, address, latestInfo, clientResponse, expectedCloseDate, source, priority, score, probability]
    );
    const id = r.insertId;
    const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [id]);
    return res.status(201).json(rows[0]);
  } catch (e) {
    // Fallback for legacy schema without new columns
    if (e && e.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const [r2] = await pool.query(
          'INSERT INTO leads (client_name, project_name, estimated_value, status, follow_up_date, employee_id, phone, address, latest_info, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
          [clientName, projectName, estimatedValue, status, followUpDate, employeeId, phone, address, latestInfo]
        );
        const id2 = r2.insertId;
        const [rows2] = await pool.query('SELECT * FROM leads WHERE id=?', [id2]);
        return res.status(201).json(rows2[0]);
      } catch (e2) {
        return res.status(500).json({ error: 'Server error' });
      }
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/leads/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { clientName, projectName, estimatedValue, status, followUpDate, employeeId, phone, address, latestInfo, clientResponse, expectedCloseDate, source, priority, score, probability } = req.body || {};
  try {
    await pool.query(
      'UPDATE leads SET client_name=COALESCE(?,client_name), project_name=COALESCE(?,project_name), estimated_value=COALESCE(?,estimated_value), status=COALESCE(?,status), follow_up_date=COALESCE(?,follow_up_date), employee_id=COALESCE(?,employee_id), phone=COALESCE(?,phone), address=COALESCE(?,address), latest_info=COALESCE(?,latest_info), client_response=COALESCE(?,client_response), expected_close_date=COALESCE(?,expected_close_date), source=COALESCE(?,source), priority=COALESCE(?,priority), score=COALESCE(?,score), probability=COALESCE(?,probability) WHERE id=?',
      [clientName, projectName, estimatedValue, status, followUpDate, employeeId, phone, address, latestInfo, clientResponse, expectedCloseDate, source, priority, score, probability, id]
    );
  } catch (e) {
    if (e && e.code === 'ER_BAD_FIELD_ERROR') {
      await pool.query(
        'UPDATE leads SET client_name=COALESCE(?,client_name), project_name=COALESCE(?,project_name), estimated_value=COALESCE(?,estimated_value), status=COALESCE(?,status), follow_up_date=COALESCE(?,follow_up_date), employee_id=COALESCE(?,employee_id), phone=COALESCE(?,phone), address=COALESCE(?,address), latest_info=COALESCE(?,latest_info) WHERE id=?',
        [clientName, projectName, estimatedValue, status, followUpDate, employeeId, phone, address, latestInfo, id]
      );
    } else {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [id]);
  return res.json(rows[0]);
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM leads WHERE id=?', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Activities: GET /api/leads/:id/activities
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM lead_activities WHERE lead_id=? ORDER BY created_at DESC', [id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Activities: POST /api/leads/:id/activities { note }
router.post('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    if (!note) return res.status(400).json({ error: 'note required' });
    const [r] = await pool.query('INSERT INTO lead_activities (lead_id, note) VALUES (?, ?)', [id, note]);
    const [rows] = await pool.query('SELECT * FROM lead_activities WHERE id=?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Activities: DELETE /api/leads/:id/activities/:activityId
router.delete('/:id/activities/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    await pool.query('DELETE FROM lead_activities WHERE id=?', [activityId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
