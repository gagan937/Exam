const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { pool } = require('../database');
require('dotenv').config();

// ─── In-memory OTP store  ────────────────────────────────────────────────────
// Map key: email  →  { otp, expiresAt, purpose: 'register'|'reset' }
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function storeOTP(email, otp, purpose) {
  otpStore.set(email.toLowerCase(), {
    otp,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

function verifyOTP(email, otp, purpose) {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return { valid: false, reason: 'No OTP found. Please request a new one.' };
  if (record.purpose !== purpose) return { valid: false, reason: 'Invalid OTP request.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Incorrect OTP. Please try again.' };
  otpStore.delete(email.toLowerCase()); // One-time use
  return { valid: true };
}

function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/check-registration
// Checks if email/mobile is already registered BEFORE sending any OTP.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/check-registration', async (req, res) => {
  const { email, mobile } = req.body;
  if (!email || !mobile)
    return res.status(400).json({ success: false, message: 'Email and mobile are required.' });
  try {
    const [rows] = await pool.query(
      'SELECT id FROM students WHERE email = ? OR mobile = ?',
      [email.toLowerCase().trim(), mobile.trim()]
    );
    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        alreadyRegistered: true,
        message: 'This email or mobile is already registered. Please sign in instead.',
      });
    }
    return res.json({ success: true, alreadyRegistered: false });
  } catch (err) {
    console.error('Check-registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/request-otp
// Generates OTP on the SERVER and returns it so frontend can send via EmailJS.
// Re-checks if email/mobile is already taken (race-condition guard).
// ─────────────────────────────────────────────────────────────────────────────
router.post('/request-otp', async (req, res) => {
  const { email, mobile, purpose } = req.body;
  if (!email || !purpose)
    return res.status(400).json({ success: false, message: 'Email and purpose are required.' });
  if (!['register', 'reset'].includes(purpose))
    return res.status(400).json({ success: false, message: 'Invalid purpose.' });

  try {
    if (purpose === 'register') {
      if (!mobile)
        return res.status(400).json({ success: false, message: 'Mobile is required for registration.' });
      const [existing] = await pool.query(
        'SELECT id FROM students WHERE email = ? OR mobile = ?',
        [email.toLowerCase().trim(), mobile.trim()]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          alreadyRegistered: true,
          message: 'This email or mobile is already registered. Please sign in instead.',
        });
      }
    }

    // Rate-limit: block if OTP was issued in last 60 seconds
    const existingRecord = otpStore.get(email.toLowerCase());
    if (existingRecord && existingRecord.expiresAt - Date.now() > OTP_TTL_MS - 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 60 seconds before requesting another OTP.',
      });
    }

    const otp = generateOTP();
    storeOTP(email, otp, purpose);
    return res.json({ success: true, otp });
  } catch (err) {
    console.error('Request-OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// OTP is verified HERE on the backend before creating the account.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, mobile, education, password, otp } = req.body;
  if (!name || !email || !mobile || !education || !password || !otp)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  if (!/^\d{10}$/.test(mobile))
    return res.status(400).json({ success: false, message: 'Mobile must be exactly 10 digits.' });
  if (!['10th', '12th', 'Graduation'].includes(education))
    return res.status(400).json({ success: false, message: 'Invalid education level.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  // ── Backend OTP validation ─────────────────────────────────────────────────
  const otpCheck = verifyOTP(email, otp, 'register');
  if (!otpCheck.valid)
    return res.status(400).json({ success: false, message: otpCheck.reason });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE email = ? OR mobile = ?',
      [email.toLowerCase().trim(), mobile.trim()]
    );
    if (existing.length > 0)
      return res.status(409).json({
        success: false,
        alreadyRegistered: true,
        message: 'This email or mobile is already registered. Please sign in instead.',
      });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO students (name, email, mobile, education, password, is_active) VALUES (?,?,?,?,?,0)',
      [name.trim(), email.toLowerCase().trim(), mobile.trim(), education, hash]
    );
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Wait for admin approval before login.',
      studentId: result.insertId,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const {email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE email = ?',
      [email.toLowerCase()]
    );
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials. Check mobile, email and password.' });
    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials. Check email and password.' });
    if (!student.is_active)
      return res.status(403).json({ success: false, message: 'ACCOUNT_DISABLED', code: 'ACCOUNT_DISABLED' });

    const token = jwt.sign(
      { id: student.id, name: student.name, email: student.email, education: student.education },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ success: true, token, student: {
      id: student.id, name: student.name, email: student.email,
      mobile: student.mobile, education: student.education, created_at: student.created_at,
    }});
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email, mobile } = req.body;
  if (!email || !mobile)
    return res.status(400).json({ success: false, message: 'Email and mobile are required.' });
  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM students WHERE email = ? AND mobile = ?',
      [email.toLowerCase(), mobile]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'No account found with this email and mobile combination.' });

    const existingOtp = otpStore.get(email.toLowerCase());
    if (existingOtp && existingOtp.expiresAt - Date.now() > OTP_TTL_MS - 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 60 seconds before requesting another OTP.',
      });
    }

    const otp = generateOTP();
    storeOTP(email, otp, 'reset');
    return res.json({ success: true, name: rows[0].name, studentId: rows[0].id, otp });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password — now verifies OTP on backend
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { email, mobile, newPassword, otp } = req.body;
  if (!email || !mobile || !newPassword || !otp)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  // ── Backend OTP validation ─────────────────────────────────────────────────
  const otpCheck = verifyOTP(email, otp, 'reset');
  if (!otpCheck.valid)
    return res.status(400).json({ success: false, message: otpCheck.reason });

  try {
    const [rows] = await pool.query(
      'SELECT id FROM students WHERE email = ? AND mobile = ?',
      [email.toLowerCase(), mobile]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Account not found.' });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE students SET password = ? WHERE id = ?', [hash, rows[0].id]);
    return res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile, education, is_active, created_at FROM students WHERE id = ?',
      [req.student.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, student: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
