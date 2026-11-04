import { Router, type Response } from 'express';
import crypto from 'node:crypto';
import { db } from './db.js';
import {
  authMiddleware,
  createSession,
  deleteSession,
  getUserByEmail,
  hashPassword,
  verifyPassword,
  type AuthenticatedRequest,
} from './auth.js';
import { answerSchoolQuestion, generateStudyPack } from './gemini.js';

export const apiRouter = Router();

// ---------------- AUTH ROUTES ----------------

// Register
apiRouter.post('/auth/register', (req, res: Response) => {
  try {
    const { name, email, password, selected_class } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const existing = getUserByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const classNum = Math.min(Math.max(Number(selected_class) || 5, 1), 10);
    const { salt, hash } = hashPassword(String(password));
    const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
    const avatarColors = ['indigo', 'emerald', 'sky', 'amber', 'rose', 'violet'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, salt, selected_class, avatar_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(userId, String(name).trim(), cleanEmail, hash, salt, classNum, avatarColor, createdAt);

    const token = createSession(userId);
    res.json({
      token,
      user: {
        id: userId,
        name: String(name).trim(),
        email: cleanEmail,
        selected_class: classNum,
        avatar_color: avatarColor,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const user = getUserByEmail(cleanEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = verifyPassword(String(password), user.salt, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = createSession(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        selected_class: user.selected_class,
        avatar_color: user.avatar_color,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Me
apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      selected_class: user.selected_class,
      avatar_color: user.avatar_color,
    },
  });
});

// Logout
apiRouter.post('/auth/logout', (req, res: Response) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']);
  }
  if (token) {
    deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Update Class
apiRouter.put('/auth/class', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { selected_class } = req.body;
  const classNum = Math.min(Math.max(Number(selected_class) || 1, 1), 10);

  const stmt = db.prepare('UPDATE users SET selected_class = ? WHERE id = ?');
  stmt.run(classNum, user.id);

  res.json({
    success: true,
    selected_class: classNum,
    message: `Updated to Class ${classNum}. Explanations and study packs will now be calibrated for Class ${classNum}.`,
  });
});

// Update Profile
apiRouter.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Name cannot be empty.' });
    return;
  }
  const cleanName = String(name).trim();
  const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
  stmt.run(cleanName, user.id);

  res.json({ success: true, name: cleanName });
});

// ---------------- ASK AI ROUTES ----------------

// Ask Question
apiRouter.post('/ask', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { question, subject } = req.body;

  if (!question || !String(question).trim()) {
    res.status(400).json({ error: 'Please enter a question to ask.' });
    return;
  }

  try {
    const aiResult = await answerSchoolQuestion(
      String(question).trim(),
      user.selected_class,
      subject ? String(subject).trim() : undefined
    );

    const qId = `q_${crypto.randomBytes(12).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO questions (id, user_id, class_level, question, subject, simple_answer, explanation, example, key_point, is_unclear, clarification_prompt, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      qId,
      user.id,
      user.selected_class,
      String(question).trim(),
      aiResult.subject || 'General',
      aiResult.simple_answer,
      aiResult.explanation,
      aiResult.example || '',
      aiResult.key_point,
      aiResult.is_unclear ? 1 : 0,
      aiResult.clarification_prompt || '',
      createdAt
    );

    res.json({
      id: qId,
      user_id: user.id,
      class_level: user.selected_class,
      question: String(question).trim(),
      ...aiResult,
      created_at: createdAt,
    });
  } catch (err: any) {
    console.error('Ask AI error:', err);
    res.status(500).json({
      error: 'Failed to process question with AI. ' + (err.message || 'Please try again.'),
    });
  }
});

// Get User's Question History (Strictly scoped to user_id)
apiRouter.get('/ask/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const stmt = db.prepare(`
    SELECT * FROM questions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `);
  const rows = stmt.all(user.id);
  res.json({ questions: rows });
});

// Delete a question from history (Strictly scoped to user_id)
apiRouter.delete('/ask/history/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM questions WHERE id = ? AND user_id = ?');
  const result: any = stmt.run(id, user.id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Question not found or you do not have permission to delete it.' });
    return;
  }

  res.json({ success: true, message: 'Question deleted from history.' });
});

// ---------------- STUDY PACK ROUTES ----------------

// Generate Study Pack
apiRouter.post('/studypacks/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { fileBufferBase64, mimeType, textContent, userPromptTitle, fileName, fileType } = req.body;

  if (!fileBufferBase64 && !textContent) {
    res.status(400).json({ error: 'Please provide textbook notes or upload a PDF/photo.' });
    return;
  }

  try {
    const studyPackResult = await generateStudyPack({
      classLevel: user.selected_class,
      fileBufferBase64,
      mimeType,
      textContent,
      userPromptTitle,
      fileName,
    });

    const spId = `sp_${crypto.randomBytes(12).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const finalFileName = fileName || (fileBufferBase64 ? 'Uploaded_Document' : 'Text_Notes');
    const finalFileType = fileType || (mimeType?.includes('pdf') ? 'pdf' : mimeType?.includes('image') ? 'image' : 'text');

    const insert = db.prepare(`
      INSERT INTO study_packs (id, user_id, title, class_level, subject, file_name, file_type, summary, topics_json, important_points_json, quiz_json, flashcards_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      spId,
      user.id,
      studyPackResult.title || userPromptTitle || 'Study Pack',
      user.selected_class,
      studyPackResult.subject || 'General',
      finalFileName,
      finalFileType,
      studyPackResult.summary,
      JSON.stringify(studyPackResult.topics),
      JSON.stringify(studyPackResult.important_points),
      JSON.stringify(studyPackResult.quiz),
      JSON.stringify(studyPackResult.flashcards),
      createdAt
    );

    res.json({
      id: spId,
      user_id: user.id,
      title: studyPackResult.title || userPromptTitle || 'Study Pack',
      class_level: user.selected_class,
      subject: studyPackResult.subject,
      file_name: finalFileName,
      file_type: finalFileType,
      summary: studyPackResult.summary,
      topics: studyPackResult.topics,
      important_points: studyPackResult.important_points,
      quiz: studyPackResult.quiz,
      flashcards: studyPackResult.flashcards,
      created_at: createdAt,
    });
  } catch (err: any) {
    console.error('Study Pack generation error:', err);
    res.status(500).json({
      error: 'Failed to generate study pack. ' + (err.message || 'Please check your input and try again.'),
    });
  }
});

// List User's Study Packs (Strictly scoped to user_id)
apiRouter.get('/studypacks', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const stmt = db.prepare(`
    SELECT id, user_id, title, class_level, subject, file_name, file_type, summary, created_at
    FROM study_packs
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);
  const rows = stmt.all(user.id);
  res.json({ studyPacks: rows });
});

// Get Single Study Pack (Strictly scoped to user_id)
apiRouter.get('/studypacks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const stmt = db.prepare('SELECT * FROM study_packs WHERE id = ? AND user_id = ?');
  const row: any = stmt.get(id, user.id);

  if (!row) {
    res.status(404).json({ error: 'Study pack not found or access denied.' });
    return;
  }

  res.json({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    class_level: row.class_level,
    subject: row.subject,
    file_name: row.file_name,
    file_type: row.file_type,
    summary: row.summary,
    topics: JSON.parse(row.topics_json || '[]'),
    important_points: JSON.parse(row.important_points_json || '[]'),
    quiz: JSON.parse(row.quiz_json || '[]'),
    flashcards: JSON.parse(row.flashcards_json || '[]'),
    created_at: row.created_at,
  });
});

// Delete Single Study Pack (Strictly scoped to user_id)
apiRouter.delete('/studypacks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM study_packs WHERE id = ? AND user_id = ?');
  const result: any = stmt.run(id, user.id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Study pack not found or access denied.' });
    return;
  }

  res.json({ success: true, message: 'Study pack deleted successfully.' });
});

// Demo accounts info for instant data isolation testing
apiRouter.get('/demo-accounts', (req, res: Response) => {
  res.json({
    accounts: [
      {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: 'password123',
        class: 4,
        description: 'Class 4 Student (Fractions, Solar System)',
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        class: 9,
        description: 'Class 9 Student (Photosynthesis, Cell Biology)',
      },
    ],
  });
});
