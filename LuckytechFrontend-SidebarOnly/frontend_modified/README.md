# 🎓 EduExam - Student Exam Portal

A full-featured React exam platform with registration, login, adaptive exam, timer, and results.

## 📁 Directory Structure

```
exam-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Router
    ├── context/
    │   └── AuthContext.jsx   # Auth state (register/login/results)
    ├── utils/
    │   └── questionUtils.js  # Pick 100 random questions by level
    ├── data/
    │   └── questions.json    # 360+ questions (easy/medium/hard)
    └── pages/
        ├── Register.jsx      # Registration form
        ├── Login.jsx         # Login form
        ├── Dashboard.jsx     # Student dashboard + stats
        ├── Exam.jsx          # Live exam with timer + question grid
        └── Results.jsx       # Results history + detailed review
```

## 🚀 Setup & Run

```bash
cd exam-app
npm install
npm run dev
```

Open http://localhost:5173

## ✨ Features

| Feature | Details |
|---------|---------|
| Registration | Name, Gmail, Mobile, Education, Password |
| Login | Mobile + Gmail + Password |
| Dashboard | Stats: exams taken, best score, average |
| Adaptive Questions | 10th = Easy, 12th = Medium, Graduation = Hard |
| Exam Engine | 100 random questions from JSON bank |
| Live Timer | 60-minute countdown, auto-submit on timeout |
| Question Map | Visual grid showing answered/current/unanswered |
| Results | Score, pass/fail, time taken |
| Detailed Review | See correct answer vs your answer for every question |
| Persistence | All data stored in localStorage |

## 📊 Question Bank

- **Easy** (10th): 120+ questions — GK, Science, Math, English, History
- **Medium** (12th): 120+ questions — Physics, Chemistry, Biology, Math, Computer
- **Hard** (Graduation): 120+ questions — Advanced topics, Research-level concepts

## 🎨 Tech Stack

- **React 18** with hooks
- **Vite** for fast dev server
- **Tailwind CSS** via CDN
- **localStorage** for data persistence
- **No backend required** — fully client-side
