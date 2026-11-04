import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { apiRouter } from './server/routes.js';
import { seedTestAccounts } from './server/auth.js';

// Seed test accounts for instant data separation verification
try {
  seedTestAccounts();
} catch (e) {
  console.warn('Test account seeding warning:', e);
}

const app = express();
const PORT = 3000;

// Middleware for large PDF and image payload parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes mounted at /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyPack AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
