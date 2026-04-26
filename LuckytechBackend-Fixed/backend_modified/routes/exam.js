// const express = require('express');
// const router  = express.Router();
// const { pool } = require('../database');
// const auth    = require('../middleware/auth');
// require('dotenv').config();

// const LEVEL_MAP = { '10th': 'easy', '12th': 'medium', 'Graduation': 'hard' };

// // GET /api/exam/questions
// router.get('/questions', auth, async (req, res) => {
//   try {
//     // Check if student is active/enabled
//     const [[student]] = await pool.query('SELECT is_active FROM students WHERE id = ?', [req.student.id]);
//     if (!student || !student.is_active) {
//       return res.status(403).json({ success: false, message: 'ACCOUNT_DISABLED', code: 'ACCOUNT_DISABLED' });
//     }

//     // Check if student already completed an exam (one-time rule)
//     const [existing] = await pool.query(
//       "SELECT id FROM exam_sessions WHERE student_id = ? AND status IN ('completed','timed_out')",
//       [req.student.id]
//     );
//     if (existing.length > 0) {
//       return res.status(403).json({ success: false, message: 'EXAM_ALREADY_TAKEN', code: 'EXAM_ALREADY_TAKEN' });
//     }

//     const TOTAL_QUESTIONS = parseInt(process.env.EXAM_QUESTIONS || '10');
//     const difficulty = LEVEL_MAP[req.student.education] || 'easy';

//     const [rows] = await pool.query(
//       `SELECT id, question_key, question, option_a, option_b, option_c, option_d, answer, subject
//        FROM questions WHERE difficulty = ? AND is_active = 1
//        ORDER BY RAND() LIMIT ?`,
//       [difficulty, TOTAL_QUESTIONS]
//     );
//     if (rows.length < TOTAL_QUESTIONS) {
//       return res.status(404).json({ success: false, message: `Not enough questions. Found ${rows.length}/${TOTAL_QUESTIONS}. Run node seed.js.` });
//     }
//     const questions = rows.map(q => ({
//       id: q.id, key: q.question_key, question: q.question,
//       options: [q.option_a, q.option_b, q.option_c, q.option_d],
//       answer: q.answer, subject: q.subject,
//     }));
//     return res.json({ success: true, questions, difficulty, total: TOTAL_QUESTIONS });
//   } catch (err) {
//     console.error('Fetch questions error:', err);
//     return res.status(500).json({ success: false, message: 'Server error fetching questions.' });
//   }
// });

// // POST /api/exam/start
// router.post('/start', auth, async (req, res) => {
//   try {
//     const [[student]] = await pool.query('SELECT is_active FROM students WHERE id = ?', [req.student.id]);
//     if (!student || !student.is_active) {
//       return res.status(403).json({ success: false, message: 'ACCOUNT_DISABLED', code: 'ACCOUNT_DISABLED' });
//     }
//     const [existing] = await pool.query(
//       "SELECT id FROM exam_sessions WHERE student_id = ? AND status IN ('completed','timed_out')",
//       [req.student.id]
//     );
//     if (existing.length > 0) {
//       return res.status(403).json({ success: false, message: 'EXAM_ALREADY_TAKEN', code: 'EXAM_ALREADY_TAKEN' });
//     }
//     const TOTAL_QUESTIONS = parseInt(process.env.EXAM_QUESTIONS || '10');
//     const difficulty = LEVEL_MAP[req.student.education] || 'easy';
//     const [result] = await pool.query(
//       "INSERT INTO exam_sessions (student_id, difficulty, education, total_qs, status) VALUES (?,?,?,?,'in_progress')",
//       [req.student.id, difficulty, req.student.education, TOTAL_QUESTIONS]
//     );
//     return res.json({ success: true, sessionId: result.insertId });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error starting exam.' });
//   }
// });

// // POST /api/exam/submit
// router.post('/submit', auth, async (req, res) => {
//   const { sessionId, answers, questions, timeTaken } = req.body;
//   if (!sessionId || !questions || !Array.isArray(questions)) {
//     return res.status(400).json({ success: false, message: 'Missing required fields.' });
//   }
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();
//     const [sessions] = await conn.query(
//       'SELECT id, status FROM exam_sessions WHERE id = ? AND student_id = ?',
//       [sessionId, req.student.id]
//     );
//     if (sessions.length === 0) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Session not found.' }); }
//     if (sessions[0].status !== 'in_progress') { await conn.rollback(); return res.status(400).json({ success: false, message: 'Exam already submitted.' }); }

//     let score = 0;
//     const answerRows = [];
//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       const selectedOpt = (answers[i] !== undefined && answers[i] !== null) ? answers[i] : null;
//       const isCorrect = (selectedOpt !== null && selectedOpt === q.answer) ? 1 : 0;
//       if (isCorrect) score++;
//       answerRows.push([sessionId, q.id, i, selectedOpt, isCorrect]);
//     }
//     if (answerRows.length > 0) {
//       await conn.query('INSERT INTO exam_answers (session_id, question_id, question_idx, selected_opt, is_correct) VALUES ?', [answerRows]);
//     }
//     const status = (timeTaken >= 3600) ? 'timed_out' : 'completed';
//     await conn.query(
//       'UPDATE exam_sessions SET score=?, time_taken=?, status=?, completed_at=NOW() WHERE id=?',
//       [score, timeTaken || 0, status, sessionId]
//     );
//     await conn.commit();
//     return res.json({ success: true, score, total: questions.length, sessionId });
//   } catch (err) {
//     await conn.rollback();
//     return res.status(500).json({ success: false, message: 'Server error saving exam.' });
//   } finally {
//     conn.release();
//   }
// });

// module.exports = router;








const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const auth    = require('../middleware/auth');
require('dotenv').config();

const LEVEL_MAP = { '10th': 'easy', '12th': 'medium', 'Graduation': 'hard' };

// GET /api/exam/questions
router.get('/questions', auth, async (req, res) => {
  try {
    // Check if student is active/enabled
    const [[student]] = await pool.query('SELECT is_active FROM students WHERE id = ?', [req.student.id]);
    if (!student || !student.is_active) {
      return res.status(403).json({ success: false, message: 'ACCOUNT_DISABLED', code: 'ACCOUNT_DISABLED' });
    }

    // Check if student already completed an exam (one-time rule)
    const [existing] = await pool.query(
      "SELECT id FROM exam_sessions WHERE student_id = ? AND status IN ('completed','timed_out')",
      [req.student.id]
    );
    if (existing.length > 0) {
      return res.status(403).json({ success: false, message: 'EXAM_ALREADY_TAKEN', code: 'EXAM_ALREADY_TAKEN' });
    }

    const TOTAL_QUESTIONS = parseInt(process.env.EXAM_QUESTIONS || '10');
    const difficulty = LEVEL_MAP[req.student.education] || 'easy';

    const [rows] = await pool.query(
      `SELECT id, question_key, question, option_a, option_b, option_c, option_d, answer, subject
       FROM questions WHERE difficulty = ? AND is_active = 1
       ORDER BY RAND() LIMIT ?`,
      [difficulty, TOTAL_QUESTIONS]
    );
    if (rows.length < TOTAL_QUESTIONS) {
      return res.status(404).json({ success: false, message: `Not enough questions. Found ${rows.length}/${TOTAL_QUESTIONS}. Run node seed.js.` });
    }
    const questions = rows.map(q => ({
      id: q.id, key: q.question_key, question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      answer: q.answer, subject: q.subject,
    }));
    return res.json({ success: true, questions, difficulty, total: TOTAL_QUESTIONS });
  } catch (err) {
    console.error('Fetch questions error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching questions.' });
  }
});

// POST /api/exam/start
router.post('/start', auth, async (req, res) => {
  try {
    const [[student]] = await pool.query('SELECT is_active FROM students WHERE id = ?', [req.student.id]);
    if (!student || !student.is_active) {
      return res.status(403).json({ success: false, message: 'ACCOUNT_DISABLED', code: 'ACCOUNT_DISABLED' });
    }
    const [existing] = await pool.query(
      "SELECT id FROM exam_sessions WHERE student_id = ? AND status IN ('completed','timed_out')",
      [req.student.id]
    );
    if (existing.length > 0) {
      return res.status(403).json({ success: false, message: 'EXAM_ALREADY_TAKEN', code: 'EXAM_ALREADY_TAKEN' });
    }
    const TOTAL_QUESTIONS = parseInt(process.env.EXAM_QUESTIONS || '10');
    const difficulty = LEVEL_MAP[req.student.education] || 'easy';
    const [result] = await pool.query(
      "INSERT INTO exam_sessions (student_id, difficulty, education, total_qs, status) VALUES (?,?,?,?,'in_progress')",
      [req.student.id, difficulty, req.student.education, TOTAL_QUESTIONS]
    );
    return res.json({ success: true, sessionId: result.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error starting exam.' });
  }
});

// POST /api/exam/submit
router.post('/submit', auth, async (req, res) => {
  const { sessionId, answers, questions, timeTaken } = req.body;
  if (!sessionId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [sessions] = await conn.query(
      'SELECT id, status FROM exam_sessions WHERE id = ? AND student_id = ?',
      [sessionId, req.student.id]
    );
    if (sessions.length === 0) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Session not found.' }); }
    if (sessions[0].status !== 'in_progress') { await conn.rollback(); return res.status(400).json({ success: false, message: 'Exam already submitted.' }); }

    let score = 0;
    const answerRows = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const selectedOpt = (answers[i] !== undefined && answers[i] !== null) ? answers[i] : null;
      const isCorrect = (selectedOpt !== null && selectedOpt === q.answer) ? 1 : 0;
      if (isCorrect) score++;
      answerRows.push([sessionId, q.id, i, selectedOpt, isCorrect]);
    }
    if (answerRows.length > 0) {
      await conn.query('INSERT INTO exam_answers (session_id, question_id, question_idx, selected_opt, is_correct) VALUES ?', [answerRows]);
    }
    const status = (timeTaken >= 3600) ? 'timed_out' : 'completed';
    await conn.query(
      'UPDATE exam_sessions SET score=?, time_taken=?, status=?, completed_at=NOW() WHERE id=?',
      [score, timeTaken || 0, status, sessionId]
    );
    await conn.commit();
    return res.json({ success: true, score, total: questions.length, sessionId });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: 'Server error saving exam.' });
  } finally {
    conn.release();
  }
});

// POST /api/exam/translate — Google Translate FREE, UNLIMITED, No API Key
router.post('/translate', auth, async (req, res) => {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'questions array required' });
  }

  // Google Translate unofficial endpoint — free & unlimited
  const googleTranslate = async (texts) => {
    const https = require('https');
    const SEP = '\n||||\n';
    const joined = texts.join(SEP);
    const path = '/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=' + encodeURIComponent(joined);
    return new Promise((resolve, reject) => {
      const options = { hostname: 'translate.googleapis.com', path, method: 'GET' };
      https.get(options, (r) => {
        let raw = '';
        r.on('data', chunk => raw += chunk);
        r.on('end', () => {
          try {
            const data = JSON.parse(raw);
            const joined2 = (data[0] || []).map(s => s[0] || '').join('');
            resolve(joined2.split(SEP));
          } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
  };

  try {
    const allQTexts = questions.map(q => q.question);
    const allOptTexts = questions.flatMap(q => q.options || []);
    const [translatedQs, translatedOpts] = await Promise.all([
      googleTranslate(allQTexts),
      googleTranslate(allOptTexts),
    ]);
    const translated = [];
    let optIdx = 0;
    questions.forEach((q, i) => {
      const optsCount = (q.options || []).length;
      translated.push({
        i,
        q: translatedQs[i] || q.question,
        opts: translatedOpts.slice(optIdx, optIdx + optsCount),
      });
      optIdx += optsCount;
    });
    return res.json({ success: true, translated });
  } catch (err) {
    console.error('Translation error:', err.message);
    return res.status(500).json({ success: false, message: 'Translation failed: ' + err.message });
  }
});

module.exports = router;
