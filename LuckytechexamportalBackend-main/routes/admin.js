// const express = require('express');
const express = require('express');
const router  = express.Router();
 
const bcrypt  = require('bcryptjs');
const { pool } = require('../database');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [[s]]  = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[sa]] = await pool.query('SELECT COUNT(*) AS total FROM students WHERE is_active = 1');
    const [[e]]  = await pool.query("SELECT COUNT(*) AS total FROM exam_sessions WHERE status IN ('completed','timed_out')");
    const [[a]]  = await pool.query("SELECT ROUND(AVG(score),1) AS avg FROM exam_sessions WHERE status = 'completed'");
    const [[q]]  = await pool.query('SELECT COUNT(*) AS total FROM questions WHERE is_active = 1');
    const examQs = parseInt(process.env.EXAM_QUESTIONS || '10'); 
    return res.json({ success: true, stats: {
      total_students:   s.total,
      active_students:  sa.total,
      total_exams:      e.total,
      avg_score:        a.avg || 0,
      total_questions:  q.total,
      exam_questions:   examQs,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/students
router.get('/students', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.email, s.mobile, s.education, s.is_active, s.created_at,
             COUNT(e.id) AS exams_taken,
             MAX(e.score) AS best_score,
             MAX(e.completed_at) AS last_exam
      FROM students s
      LEFT JOIN exam_sessions e ON e.student_id = s.id AND e.status IN ('completed','timed_out')
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    return res.json({ success: true, students: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/admin/student/:id/toggle
router.patch('/student/:id/toggle', adminAuth, async (req, res) => {
  try {
    const [[student]] = await pool.query('SELECT id, is_active, name FROM students WHERE id = ?', [req.params.id]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const newStatus = student.is_active ? 0 : 1;
    await pool.query('UPDATE students SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    return res.json({ success: true, is_active: newStatus, message: `${student.name} has been ${newStatus ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/admin/student/:id
router.put('/student/:id', adminAuth, async (req, res) => {
  const { name, email, mobile, education, password } = req.body;
  if (!name || !email || !mobile || !education) {
    return res.status(400).json({ success: false, message: 'Name, email, mobile, education are required.' });
  }
  try {
    const [dup] = await pool.query(
      'SELECT id FROM students WHERE (email = ? OR mobile = ?) AND id != ?',
      [email.toLowerCase(), mobile, req.params.id]
    );
    if (dup.length > 0) return res.status(409).json({ success: false, message: 'Email or mobile already used by another student.' });

    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 12);
      await pool.query(
        'UPDATE students SET name=?, email=?, mobile=?, education=?, password=? WHERE id=?',
        [name.trim(), email.toLowerCase().trim(), mobile, education, hash, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE students SET name=?, email=?, mobile=?, education=? WHERE id=?',
        [name.trim(), email.toLowerCase().trim(), mobile, education, req.params.id]
      );
    }
    return res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/student/:id
router.delete('/student/:id', adminAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE ea FROM exam_answers ea JOIN exam_sessions es ON ea.session_id = es.id WHERE es.student_id = ?`, [req.params.id]);
    await conn.query('DELETE FROM exam_sessions WHERE student_id = ?', [req.params.id]);
    await conn.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    await conn.commit();
    return res.json({ success: true, message: 'Student deleted permanently.' });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// PATCH /api/admin/student/:id/reset-exam
// router.patch('/student/:id/reset-exam', adminAuth, async (req, res) => {
//   try {
//     await pool.query(
//       "UPDATE exam_sessions SET status = 'reset' WHERE student_id = ? AND status IN ('completed','timed_out')",
//       [req.params.id]
//     );
//     return res.json({ success: true, message: 'Exam reset. Student can take exam again.' });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error.' });
//   }
// });
router.patch('/student/:id/reset-exam', adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM exam_sessions 
       WHERE student_id = ? 
       AND status IN ('completed', 'timed_out', 'in_progress')`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'No active or completed exam found.' });
    }

    return res.json({ success: true, message: 'Exam reset. Student can take exam again.' });
  } catch (err) {
    console.error('Reset exam error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/settings
router.get('/settings', adminAuth, async (req, res) => {
  return res.json({ success: true, exam_questions: parseInt(process.env.EXAM_QUESTIONS || '10') });
});

// PUT /api/admin/settings
router.put('/settings', adminAuth, async (req, res) => {
  const { exam_questions } = req.body;
  const n = parseInt(exam_questions);
  if (!n || n < 1 || n > 200) {
    return res.status(400).json({ success: false, message: 'exam_questions must be between 1 and 200.' });
  }
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.match(/^EXAM_QUESTIONS=.*/m)) {
      envContent = envContent.replace(/^EXAM_QUESTIONS=.*/m, `EXAM_QUESTIONS=${n}`);
    } else {
      envContent += `\nEXAM_QUESTIONS=${n}`;
    }
    fs.writeFileSync(envPath, envContent);
    process.env.EXAM_QUESTIONS = String(n);
    return res.json({ success: true, exam_questions: n, message: `Exam set to ${n} questions.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not save settings: ' + err.message });
  }
});

// POST /api/admin/question
router.post('/question', adminAuth, async (req, res) => {
  const { question_key, question, option_a, option_b, option_c, option_d, answer, subject, difficulty } = req.body;
  if (!question_key || !question || !option_a || !option_b || !option_c || !option_d || answer === undefined || !subject || !difficulty) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO questions (question_key, question, option_a, option_b, option_c, option_d, answer, subject, difficulty) VALUES (?,?,?,?,?,?,?,?,?)',
      [question_key, question, option_a, option_b, option_c, option_d, answer, subject, difficulty]
    );
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── NEW: GET /api/admin/student/:id/results — all sessions for a student ─────
router.get('/student/:id/results', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, score, total_qs, time_taken, status,
             difficulty, education, started_at, completed_at
      FROM exam_sessions
      WHERE student_id = ?
        AND status IN ('completed', 'timed_out')
      ORDER BY completed_at DESC
    `, [req.params.id]);
    return res.json({ success: true, results: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── NEW: GET /api/admin/student/:id/results/:sessionId — Q&A detail ──────────
router.get('/student/:id/results/:sessionId', adminAuth, async (req, res) => {
  try {
    const [[session]] = await pool.query(
      'SELECT * FROM exam_sessions WHERE id = ? AND student_id = ?',
      [req.params.sessionId, req.params.id]
    );
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const [answers] = await pool.query(`
      SELECT
        ea.question_idx,
        ea.selected_opt,
        ea.is_correct,
        q.id          AS question_id,
        q.question,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.answer      AS correct_answer,
        q.subject
      FROM exam_answers ea
      JOIN questions q ON q.id = ea.question_id
      WHERE ea.session_id = ?
      ORDER BY ea.question_idx
    `, [req.params.sessionId]);

    const questions = answers.map(a => ({
      idx:       a.question_idx,
      question:  a.question,
      options:   [a.option_a, a.option_b, a.option_c, a.option_d],
      answer:    a.correct_answer,
      selected:  a.selected_opt,
      isCorrect: a.is_correct === 1,
      subject:   a.subject,
    }));

    return res.json({ success: true, session, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;