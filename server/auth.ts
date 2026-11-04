import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  selected_class: number;
  avatar_color: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
  } catch {
    return false;
  }
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const insert = db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)');
  insert.run(token, userId, now.toISOString(), expiresAt.toISOString());
  return token;
}

export function deleteSession(token: string): void {
  const del = db.prepare('DELETE FROM sessions WHERE token = ?');
  del.run(token);
}

export function getUserByToken(token: string): UserRecord | null {
  if (!token) return null;
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `);
  const user = stmt.get(token) as UserRecord | undefined;
  return user || null;
}

export function getUserById(id: string): UserRecord | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id) as UserRecord | undefined;
  return user || null;
}

export function getUserByEmail(email: string): UserRecord | null {
  const stmt = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)');
  const user = stmt.get(email) as UserRecord | undefined;
  return user || null;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']);
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const user = getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  req.user = user;
  next();
}

// Seed two distinct test student accounts to verify complete data separation
export function seedTestAccounts(): void {
  // Test Account 1: Aarav (Class 4)
  const user1 = getUserByEmail('aarav@example.com');
  if (!user1) {
    const { salt, hash } = hashPassword('password123');
    const u1Id = 'user_aarav_class4';
    const insUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, salt, selected_class, avatar_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insUser.run(u1Id, 'Aarav Sharma', 'aarav@example.com', hash, salt, 4, 'amber', new Date().toISOString());

    // Seed sample question for Aarav (Class 4 level)
    const insQ = db.prepare(`
      INSERT INTO questions (id, user_id, class_level, question, subject, simple_answer, explanation, example, key_point, is_unclear, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insQ.run(
      'q_aarav_1',
      u1Id,
      4,
      'What is a fraction?',
      'Maths',
      'A fraction is a small part of a whole thing that is broken into equal pieces.',
      'When you take one big whole object (like a pizza) and slice it into equal parts, each part is called a fraction. The top number tells how many slices you have, and the bottom number tells how many slices made up the whole pizza!',
      'If you cut an apple into 4 equal slices and eat 1 slice, you ate 1/4 (one-fourth) of the apple.',
      'The top number is the Numerator and the bottom number is the Denominator.',
      0,
      new Date().toISOString()
    );

    // Seed sample study pack for Aarav
    const insSp = db.prepare(`
      INSERT INTO study_packs (id, user_id, title, class_level, subject, file_name, file_type, summary, topics_json, important_points_json, quiz_json, flashcards_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insSp.run(
      'sp_aarav_1',
      u1Id,
      'Our Solar System & The Sun',
      4,
      'Science',
      'class4_solar_system.pdf',
      'pdf',
      'Our solar system consists of the Sun and eight planets traveling around it in fixed paths called orbits. The Sun gives us light and warmth, making life on Earth possible.',
      JSON.stringify([
        {
          title: 'The Sun',
          subtopics: ['Huge ball of hot glowing gases', 'Source of heat and light'],
          notes: 'The Sun is at the center of the solar system. Earth receives just the right amount of sunlight.'
        },
        {
          title: 'The Eight Planets',
          subtopics: ['Mercury, Venus, Earth, Mars', 'Jupiter, Saturn, Uranus, Neptune'],
          notes: 'Earth is the third planet and the only known planet with water, air, and living beings.'
        }
      ]),
      JSON.stringify([
        'There are 8 planets in our Solar System.',
        'Mercury is the closest planet to the Sun.',
        'Earth is called the Blue Planet because of its oceans.',
        'Planets move around the Sun in fixed curved paths called orbits.'
      ]),
      JSON.stringify([
        {
          id: 1,
          question: 'How many planets are there in our solar system?',
          options: ['7 planets', '8 planets', '9 planets', '10 planets'],
          answer_index: 1,
          explanation: 'There are exactly 8 recognized planets in our solar system.'
        },
        {
          id: 2,
          question: 'Which planet is called the Blue Planet?',
          options: ['Mars', 'Jupiter', 'Earth', 'Venus'],
          answer_index: 2,
          explanation: 'Earth is called the Blue Planet because most of its surface is covered with water.'
        },
        {
          id: 3,
          question: 'What gives heat and light to our entire solar system?',
          options: ['The Moon', 'The Sun', 'The Stars', 'Comets'],
          answer_index: 1,
          explanation: 'The Sun is a glowing star at the center that provides heat and light.'
        },
        {
          id: 4,
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Mars', 'Earth'],
          answer_index: 1,
          explanation: 'Mercury is the first and closest planet to the Sun.'
        },
        {
          id: 5,
          question: 'What is the path of a planet around the Sun called?',
          options: ['Highway', 'Orbit', 'Runway', 'Circle line'],
          answer_index: 1,
          explanation: 'The fixed curved path is called an orbit.'
        },
        {
          id: 6,
          question: 'Which is the third planet from the Sun?',
          options: ['Mars', 'Venus', 'Earth', 'Mercury'],
          answer_index: 2,
          explanation: 'Earth is the third planet from the Sun.'
        },
        {
          id: 7,
          question: 'Why can life exist on Earth?',
          options: ['It has water and breathable air', 'It is made of gold', 'It never has night', 'It is the largest planet'],
          answer_index: 0,
          explanation: 'Earth has air, liquid water, and suitable temperature for life.'
        },
        {
          id: 8,
          question: 'Which planet is known for its beautiful rings?',
          options: ['Saturn', 'Mars', 'Mercury', 'Venus'],
          answer_index: 0,
          explanation: 'Saturn is famous for its bright, prominent rings.'
        },
        {
          id: 9,
          question: 'Is the Sun a planet or a star?',
          options: ['A moon', 'A planet', 'A star', 'An asteroid'],
          answer_index: 2,
          explanation: 'The Sun is actually a star located at the center of our solar system.'
        },
        {
          id: 10,
          question: 'Which is the farthest planet from the Sun?',
          options: ['Uranus', 'Jupiter', 'Neptune', 'Saturn'],
          answer_index: 2,
          explanation: 'Neptune is the eighth and farthest planet from the Sun.'
        }
      ]),
      JSON.stringify([
        { id: 1, front: 'What is an Orbit?', back: 'The curved imaginary path followed by a planet around the Sun.', hint: 'Think of a running track' },
        { id: 2, front: 'Why is Earth called the Blue Planet?', back: 'Because nearly 71% of Earth is covered with water!', hint: 'Color of oceans' },
        { id: 3, front: 'What is the Sun?', back: 'A giant star made of glowing hot gases at the center of the solar system.', hint: 'Star, not planet' },
        { id: 4, front: 'Name the smallest and closest planet to the Sun.', back: 'Mercury.', hint: 'Starts with M' }
      ]),
      new Date().toISOString()
    );
  }

  // Test Account 2: Priya (Class 9)
  const user2 = getUserByEmail('priya@example.com');
  if (!user2) {
    const { salt, hash } = hashPassword('password123');
    const u2Id = 'user_priya_class9';
    const insUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, salt, selected_class, avatar_color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insUser.run(u2Id, 'Priya Patel', 'priya@example.com', hash, salt, 9, 'emerald', new Date().toISOString());

    // Seed sample question for Priya (Class 9 level)
    const insQ = db.prepare(`
      INSERT INTO questions (id, user_id, class_level, question, subject, simple_answer, explanation, example, key_point, is_unclear, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insQ.run(
      'q_priya_1',
      u2Id,
      9,
      'What is photosynthesis?',
      'Science (Biology)',
      'Photosynthesis is an autotrophic biochemical process wherein green plants synthesize glucose and oxygen from carbon dioxide and water using radiant solar energy absorbed by chlorophyll.',
      'The process takes place in the chloroplasts of plant cells in two major phases: Light-dependent reactions (occurring in thylakoid membranes where photolysis of water generates ATP and NADPH) and Light-independent Calvin Cycle (in the stroma where CO2 is enzymatically fixed into carbohydrates). Balanced chemical equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2.',
      'Variegated leaf iodine test: starch formation occurs only in green portions containing chlorophyll that were exposed to sunlight.',
      'Chemical formula: 6CO2 + 6H2O -> C6H12O6 + 6O2; Site: Chloroplast (Thylakoids & Stroma).',
      0,
      new Date().toISOString()
    );

    // Seed sample study pack for Priya
    const insSp = db.prepare(`
      INSERT INTO study_packs (id, user_id, title, class_level, subject, file_name, file_type, summary, topics_json, important_points_json, quiz_json, flashcards_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insSp.run(
      'sp_priya_1',
      u2Id,
      'Fundamental Unit of Life: Cell Structure',
      9,
      'Science (Biology)',
      'class9_chapter5_cell.pdf',
      'pdf',
      'The cell is the structural and functional unit of life discovered by Robert Hooke in 1665. Organisms can be unicellular or multicellular. The eukaryotic cell contains specialized membrane-bound organelles including the nucleus, mitochondria (ATP powerhouses), endoplasmic reticulum, Golgi apparatus, and lysosomes.',
      JSON.stringify([
        {
          title: 'Cell Membrane & Cell Wall',
          subtopics: ['Phospholipid bilayer with selective permeability', 'Rigid cellulose wall in plants', 'Diffusion & Osmosis'],
          notes: 'The plasma membrane regulates entry and exit of molecules via active and passive transport.'
        },
        {
          title: 'Nucleus & Genetic Material',
          subtopics: ['Nuclear envelope with pores', 'Chromatin fibres and DNA/Genes', 'Nucleolus (ribosome synthesis)'],
          notes: 'Directs all cellular metabolic activities and plays a central role in cellular reproduction.'
        },
        {
          title: 'Cytoplasmic Organelles',
          subtopics: ['Mitochondria (cellular respiration, ATP)', 'Endoplasmic Reticulum (RER & SER)', 'Lysosomes (Suicide bags with hydrolytic enzymes)'],
          notes: 'Mitochondria and plastids have their own circular DNA and 70S ribosomes, allowing semi-autonomous replication.'
        }
      ]),
      JSON.stringify([
        'Robert Hooke coined the term "cell" in 1665 while observing thin slices of cork under a microscope.',
        'Mitochondria produce ATP through oxidative phosphorylation, hence known as the powerhouse of the cell.',
        'Lysosomes contain digestive hydrolytic enzymes capable of digesting damaged cell components (suicide bags).',
        'Plant cells differ from animal cells by having a rigid cellulose cell wall, large central vacuoles, and chloroplasts.',
        'Osmosis is the net movement of solvent molecules through a selectively permeable membrane toward higher solute concentration.'
      ]),
      JSON.stringify([
        {
          id: 1,
          question: 'Who discovered and coined the term "cell" in 1665?',
          options: ['Robert Brown', 'Robert Hooke', 'Antonie van Leeuwenhoek', 'Rudolf Virchow'],
          answer_index: 1,
          explanation: 'Robert Hooke observed honeycomb-like cork compartments in 1665 and termed them cells.'
        },
        {
          id: 2,
          question: 'Which organelle is referred to as the powerhouse of the cell?',
          options: ['Golgi apparatus', 'Ribosome', 'Mitochondria', 'Endoplasmic reticulum'],
          answer_index: 2,
          explanation: 'Mitochondria produce energy in the form of ATP molecules required for cellular processes.'
        },
        {
          id: 3,
          question: 'Why are lysosomes known as "suicide bags"?',
          options: ['They synthesize toxic proteins', 'They release hydrolytic enzymes that digest their own damaged cell', 'They prevent cell division', 'They absorb sunlight'],
          answer_index: 1,
          explanation: 'When a cell is damaged, lysosomes may burst and their digestive enzymes digest the cell itself.'
        },
        {
          id: 4,
          question: 'Which organelle possesses its own DNA and ribosomes?',
          options: ['Lysosome', 'Mitochondria', 'Vacuole', 'Golgi apparatus'],
          answer_index: 1,
          explanation: 'Mitochondria and plastids have their own DNA and 70S ribosomes.'
        },
        {
          id: 5,
          question: 'The plant cell wall is primarily composed of which macromolecule?',
          options: ['Lipids', 'Proteins', 'Cellulose', 'Chitin'],
          answer_index: 2,
          explanation: 'Plant cell walls are made of rigid cellulose that provides structural strength.'
        },
        {
          id: 6,
          question: 'What is the function of the Rough Endoplasmic Reticulum (RER)?',
          options: ['Lipid synthesis', 'Protein synthesis and modification', 'Cell locomotion', 'ATP storage'],
          answer_index: 1,
          explanation: 'RER has ribosomes attached to its surface which actively synthesize proteins.'
        },
        {
          id: 7,
          question: 'What happens to a plant cell placed in a hypertonic solution?',
          options: ['It swells and bursts', 'It undergoes plasmolysis (shrinkage)', 'It stays exactly identical', 'It divides immediately'],
          answer_index: 1,
          explanation: 'Water leaves the cell by osmosis causing the protoplasm to shrink away from the cell wall (plasmolysis).'
        },
        {
          id: 8,
          question: 'Who modified the cell theory by stating "Omnis cellula-e cellula"?',
          options: ['Schleiden and Schwann', 'Rudolf Virchow', 'Gregor Mendel', 'Charles Darwin'],
          answer_index: 1,
          explanation: 'Rudolf Virchow in 1855 added that all living cells arise from pre-existing cells.'
        },
        {
          id: 9,
          question: 'Which structure packages and modifies proteins dispatched from the ER?',
          options: ['Golgi apparatus', 'Peroxisome', 'Centrosome', 'Cytoskeleton'],
          answer_index: 0,
          explanation: 'The Golgi apparatus modifies, sorts, and packages biochemicals into vesicles.'
        },
        {
          id: 10,
          question: 'What is the full form of the cellular energy currency ATP?',
          options: ['Adenosine Triphosphate', 'Amino Triphosphate', 'Adenine Tetra Phosphate', 'Acetyl Tripeptide'],
          answer_index: 0,
          explanation: 'ATP stands for Adenosine Triphosphate.'
        }
      ]),
      JSON.stringify([
        { id: 1, front: 'Define Plasmolysis', back: 'Shrinkage or contraction of the protoplast of a plant cell away from the cell wall caused by loss of water through osmosis in a hypertonic environment.', hint: 'Hypertonic solution' },
        { id: 2, front: 'Why are Mitochondria semi-autonomous?', back: 'Because they contain their own circular DNA and 70S ribosomes to manufacture some of their own proteins.', hint: 'Organellar DNA' },
        { id: 3, front: 'What is the function of the Golgi apparatus?', back: 'Storage, modification, and packaging of biochemical products into secretory vesicles dispatched to cellular targets.', hint: 'Post office of the cell' },
        { id: 4, front: 'Cell Theory Statement', back: '1. All living organisms are composed of one or more cells. 2. Cell is the basic unit of life. 3. All cells arise from pre-existing cells (Virchow).', hint: 'Hooke, Schleiden, Schwann, Virchow' }
      ]),
      new Date().toISOString()
    );
  }
}
