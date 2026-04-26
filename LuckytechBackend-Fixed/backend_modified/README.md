# 🎓 LuckyTech Academy — Full-Stack Exam System

A complete online exam platform with **Node.js backend**, **MySQL database**, and **React frontend**.

---

## 📁 Project Structure

```
luckytech-exam/
├── backend/                 ← Node.js Express API
│   ├── server.js            ← Main server entry point
│   ├── database.js          ← MySQL connection pool
│   ├── schema.sql           ← Database schema (run this first!)
│   ├── seed.js              ← Seed 300 questions into DB
│   ├── .env                 ← Environment variables
│   ├── middleware/
│   │   └── auth.js          ← JWT authentication middleware
│   └── routes/
│       ├── auth.js          ← Register / Login / Me
│       ├── exam.js          ← Fetch questions / Start / Submit
│       ├── results.js       ← Results history / Detail / Stats
│       └── admin.js         ← Admin panel routes
│
└── frontend/                ← React + Vite frontend
    ├── src/
    │   ├── api.js           ← Axios client (points to backend)
    │   ├── App.jsx          ← Router
    │   ├── context/
    │   │   └── AuthContext.jsx  ← JWT auth context
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── Exam.jsx
    │       └── Results.jsx
    └── package.json
```

---

## ⚡ Quick Setup

### Step 1 — MySQL Database

```sql
-- Open MySQL Workbench or terminal, then run:
mysql -u root -p < backend/schema.sql
```

Or copy-paste the contents of `backend/schema.sql` into MySQL Workbench and execute.

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env and set your MySQL password:
#   DB_PASSWORD=your_actual_mysql_password
#   DB_USER=root
#   DB_NAME=luckytech_exam

# Seed the database with 300 questions
node seed.js

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on: **http://localhost:5000**

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `students` | Registered students with hashed passwords |
| `questions` | 300 questions (100 easy / 100 medium / 100 hard) |
| `exam_sessions` | Each exam attempt with score & time |
| `exam_answers` | Individual question answers per session |
| `leaderboard` | MySQL VIEW for top performers |

### Question Levels

| Education | Difficulty | Subjects |
|-----------|-----------|----------|
| 10th Standard | Easy | Math, Science, GK, English, Geography, History |
| 12th Standard | Medium | Physics, Chemistry, Biology, Math, Computer, Civics |
| Graduation | Hard | Advanced CS, Molecular Biology, Quantum Physics, etc. |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current student profile |

### Exam
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exam/questions` | Get 100 random questions for level |
| POST | `/api/exam/start` | Create exam session in DB |
| POST | `/api/exam/submit` | Submit answers, save to DB |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | All results for logged-in student |
| GET | `/api/results/stats/me` | Stats (best score, avg, pass rate) |
| GET | `/api/results/:sessionId` | Detailed review for one exam |
| GET | `/api/results/leaderboard/top` | Top 20 leaderboard |

### Admin (requires X-Admin-Key header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System-wide stats |
| GET | `/api/admin/students` | All students |
| POST | `/api/admin/question` | Add new question |
| DELETE | `/api/admin/student/:id` | Deactivate student |

---

## 🌟 Features

- ✅ **Full Authentication** — JWT-based, bcrypt password hashing
- ✅ **300 Questions** — Easy / Medium / Hard levels from MySQL
- ✅ **Live Exam Timer** — 60-minute countdown, auto-submits
- ✅ **Paginated Exam** — 10 questions per page, save & navigate
- ✅ **Persistent Results** — All exam data saved to MySQL
- ✅ **Detailed Review** — See correct answers after exam
- ✅ **Performance Stats** — Best score, avg, pass rate
- ✅ **Admin API** — Manage students and questions
- ✅ **Leaderboard View** — MySQL VIEW for top performers

---

## 🔧 Environment Variables (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=luckytech_exam
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=your_admin_key
```
