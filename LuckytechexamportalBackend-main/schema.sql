-- ============================================================
-- LuckyTech Academy Exam System — MySQL Database Schema
-- ============================================================
-- Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS luckytech_exam
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE luckytech_exam;

-- ────────────────────────────────────────────────────────────
-- 1. STUDENTS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)    NOT NULL,
  email        VARCHAR(150)    NOT NULL UNIQUE,
  mobile       VARCHAR(15)     NOT NULL UNIQUE,
  education    ENUM('10th','12th','Graduation') NOT NULL,
  password     VARCHAR(255)    NOT NULL,
  is_active    TINYINT(1)      NOT NULL DEFAULT 1,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email  (email),
  INDEX idx_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 2. QUESTIONS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  question_key VARCHAR(20)     NOT NULL UNIQUE,
  question     TEXT            NOT NULL,
  option_a     VARCHAR(400)    NOT NULL,
  option_b     VARCHAR(400)    NOT NULL,
  option_c     VARCHAR(400)    NOT NULL,
  option_d     VARCHAR(400)    NOT NULL,
  answer       TINYINT(1)      NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
  subject      VARCHAR(50)     NOT NULL,
  difficulty   ENUM('easy','medium','hard') NOT NULL,
  is_active    TINYINT(1)      NOT NULL DEFAULT 1,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_subject    (subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 3. EXAM SESSIONS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_sessions (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  student_id   INT UNSIGNED    NOT NULL,
  difficulty   ENUM('easy','medium','hard') NOT NULL,
  education    ENUM('10th','12th','Graduation') NOT NULL,
  total_qs     SMALLINT        NOT NULL DEFAULT 100,
  score        SMALLINT        NOT NULL DEFAULT 0,
  time_taken   INT             NOT NULL DEFAULT 0 COMMENT 'in seconds',
  status       ENUM('in_progress','completed','timed_out') NOT NULL DEFAULT 'in_progress',
  started_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME        NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_status  (status),
  INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 4. EXAM ANSWERS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_answers (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id   INT UNSIGNED    NOT NULL,
  question_id  INT UNSIGNED    NOT NULL,
  question_idx SMALLINT        NOT NULL COMMENT '0-indexed position in exam',
  selected_opt TINYINT         NULL     COMMENT '0-3 or NULL if not answered',
  is_correct   TINYINT(1)      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (session_id)  REFERENCES exam_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  INDEX idx_session (session_id),
  UNIQUE KEY uq_session_idx (session_id, question_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 5. LEADERBOARD VIEW
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  s.id                                              AS student_id,
  s.name,
  s.education,
  COUNT(es.id)                                      AS exams_taken,
  COALESCE(MAX(es.score), 0)                        AS best_score,
  COALESCE(ROUND(AVG(es.score), 1), 0)              AS avg_score,
  COALESCE(SUM(es.score >= 60), 0)                  AS pass_count,
  COALESCE(ROUND(
    SUM(es.score >= 60) / NULLIF(COUNT(es.id), 0) * 100, 1
  ), 0)                                             AS pass_rate
FROM students s
LEFT JOIN exam_sessions es
  ON es.student_id = s.id
  AND es.status IN ('completed', 'timed_out')
WHERE s.is_active = 1
GROUP BY s.id, s.name, s.education
ORDER BY best_score DESC, avg_score DESC;

SELECT 'LuckyTech Academy schema created successfully!' AS status;
