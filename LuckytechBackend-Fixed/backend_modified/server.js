const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const { testConnection } = require('./database');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('CORS: origin not allowed → ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/exam',    require('./routes/exam'));
app.use('/api/results', require('./routes/results'));
app.use('/api/admin',   require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'LuckyTech Academy', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => { console.error(err.message); res.status(500).json({ success: false, message: 'Internal server error.' }); });

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 LuckyTech Academy Server → http://localhost:${PORT}`);
    console.log(`📋 Health → http://localhost:${PORT}/api/health`);
    console.log(`🎯 Exam Questions: ${process.env.EXAM_QUESTIONS || 10}\n`);
  });
}
start();
