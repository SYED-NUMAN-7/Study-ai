import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'studypack.sqlite');
export const db = new DatabaseSync(dbPath);

// Initialize tables with strict foreign keys and indexes
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    selected_class INTEGER NOT NULL DEFAULT 5,
    avatar_color TEXT NOT NULL DEFAULT 'indigo',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    class_level INTEGER NOT NULL,
    question TEXT NOT NULL,
    subject TEXT NOT NULL,
    simple_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    example TEXT,
    key_point TEXT NOT NULL,
    is_unclear INTEGER NOT NULL DEFAULT 0,
    clarification_prompt TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_packs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    class_level INTEGER NOT NULL,
    subject TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    topics_json TEXT NOT NULL,
    important_points_json TEXT NOT NULL,
    quiz_json TEXT NOT NULL,
    flashcards_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
  CREATE INDEX IF NOT EXISTS idx_study_packs_user_id ON study_packs(user_id);
`);
