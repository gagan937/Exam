const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const auth    = require('../middleware/auth');

// GET /api/results/stats/me  — summary stats for the logged-in student
// ⚠ Must be declared BEFORE /:sessionId so Express doesn't treat "stats" as an id
router.get('/stats/me', auth, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT
         COUNT(*)                             AS total_exams,
         COALESCE(MAX(score),  0)             AS best_score,
         COALESCE(ROUND(AVG(score), 1), 0)    AS avg_score,
         COALESCE(SUM(score >= 60), 0)        AS pass_count,
         COALESCE(SUM(score <  60), 0)        AS fail_count
       FROM exam_sessions
       WHERE student_id = ?
         AND status IN ('completed', 'timed_out')`,
      [req.student.id]
    );
    return res.json({ success: true, stats: row });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/results/leaderboard/top  — top 20 students
router.get('/leaderboard/top', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM leaderboard WHERE exams_taken > 0 LIMIT 20`
    );
    return res.json({ success: true, leaderboard: rows });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/results  — all completed exams for the logged-in student
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, score, total_qs, time_taken, status,
              difficulty, education, started_at, completed_at
       FROM exam_sessions
       WHERE student_id = ?
         AND status IN ('completed', 'timed_out')
       ORDER BY started_at DESC`,
      [req.student.id]
    );
    return res.json({ success: true, results: rows });
  } catch (err) {
    console.error('Fetch results error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/results/:sessionId  — detailed review of one exam
router.get('/:sessionId', auth, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [sess] = await pool.query(
      `SELECT * FROM exam_sessions WHERE id = ? AND student_id = ?`,
      [sessionId, req.student.id]
    );
    if (sess.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const [answers] = await pool.query(
      `SELECT
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
       ORDER BY ea.question_idx`,
      [sessionId]
    );

    const questions = answers.map(a => ({
      idx:      a.question_idx,
      question: a.question,
      options:  [a.option_a, a.option_b, a.option_c, a.option_d],
      answer:   a.correct_answer,
      selected: a.selected_opt,
      isCorrect: a.is_correct === 1,
      subject:  a.subject,
    }));

    return res.json({ success: true, session: sess[0], questions });
  } catch (err) {
    console.error('Fetch detail error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
