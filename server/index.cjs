const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const DATA_DIR = path.join(__dirname, '..', 'public', 'api');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5174', credentials: true }));

// Helpers
function readJson(file) {
  const p = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(file, data) {
  const p = path.join(DATA_DIR, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function signToken(user) {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyAuth(req, res, next) {
  const token = req.cookies && req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.user;
    if (!req.user || req.user.role !== 'metro_admin') {
      return res.status(403).json({ message: 'Only metro admin allowed' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const auth = readJson('auth.json');
  const user = (auth.users || []).find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.role !== 'metro_admin') return res.status(403).json({ message: 'Only metro admin allowed' });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = signToken(safeUser);
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true if using HTTPS
    maxAge: 60 * 60 * 1000,
  });
  return res.json({ success: true, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ success: true });
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.cookies && req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = payload.user;
    if (!user || user.role !== 'metro_admin') return res.status(403).json({ message: 'Only metro admin allowed' });
    return res.json({ success: true, user });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Dashboard (read-only)
app.get('/api/dashboard-stats.json', (req, res) => {
  const stats = readJson('dashboard-stats.json');
  res.json(stats);
});

// Users CRUD
app.get('/api/users', verifyAuth, (req, res) => {
  const data = readJson('users.json');
  res.json({ users: data.users || [] });
});

app.get('/api/users/:id', verifyAuth, (req, res) => {
  const data = readJson('users.json');
  const user = (data.users || []).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.post('/api/users', verifyAuth, (req, res) => {
  const data = readJson('users.json');
  const list = data.users || [];
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
  const newUser = {
    id,
    ...req.body,
    avatar: req.body.avatar || '/vite.svg',
    joinDate: new Date().toISOString().split('T')[0],
    lastLogin: req.body.lastLogin || 'Never',
    blocked: req.body.blocked ?? false,
  };
  list.push(newUser);
  writeJson('users.json', { users: list });
  res.status(201).json(newUser);
});

app.put('/api/users/:id', verifyAuth, (req, res) => {
  const data = readJson('users.json');
  const list = data.users || [];
  const idx = list.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const updated = { ...list[idx], ...req.body };
  list[idx] = updated;
  writeJson('users.json', { users: list });
  res.json(updated);
});

app.delete('/api/users/:id', verifyAuth, (req, res) => {
  const data = readJson('users.json');
  const list = data.users || [];
  const idx = list.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  list.splice(idx, 1);
  writeJson('users.json', { users: list });
  res.json({ success: true });
});

// FAQs CRUD
app.get('/api/faqs', verifyAuth, (req, res) => {
  const data = readJson('faqs.json');
  res.json({ faqs: data.faqs || [] });
});

app.get('/api/faqs/:id', verifyAuth, (req, res) => {
  const data = readJson('faqs.json');
  const faq = (data.faqs || []).find(f => f.id === req.params.id);
  if (!faq) return res.status(404).json({ message: 'FAQ not found' });
  res.json(faq);
});

app.post('/api/faqs', verifyAuth, (req, res) => {
  const data = readJson('faqs.json');
  const list = data.faqs || [];
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
  const now = new Date().toISOString();
  const newFaq = { id, createdAt: now, updatedAt: now, ...req.body };
  list.push(newFaq);
  writeJson('faqs.json', { faqs: list });
  res.status(201).json(newFaq);
});

app.put('/api/faqs/:id', verifyAuth, (req, res) => {
  const data = readJson('faqs.json');
  const list = data.faqs || [];
  const idx = list.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'FAQ not found' });
  const now = new Date().toISOString();
  const updated = { ...list[idx], ...req.body, updatedAt: now };
  list[idx] = updated;
  writeJson('faqs.json', { faqs: list });
  res.json(updated);
});

app.delete('/api/faqs/:id', verifyAuth, (req, res) => {
  const data = readJson('faqs.json');
  const list = data.faqs || [];
  const idx = list.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'FAQ not found' });
  list.splice(idx, 1);
  writeJson('faqs.json', { faqs: list });
  res.json({ success: true });
});

// Legal
app.get('/api/legal/:slug', verifyAuth, (req, res) => {
  const data = readJson('legal.json');
  const doc = data[req.params.slug];
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json(doc);
});

app.put('/api/legal/:slug', verifyAuth, (req, res) => {
  const data = readJson('legal.json');
  const slug = req.params.slug;
  if (!data[slug]) return res.status(404).json({ message: 'Document not found' });
  const now = new Date().toISOString();
  const updated = { ...data[slug], sections: req.body.sections || [], updatedAt: now };
  const next = { ...data, [slug]: updated };
  writeJson('legal.json', next);
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}/api`);
});