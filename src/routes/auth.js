import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/firebase.js';

const router = Router();
const usersCol = () => db().collection('users');

// Register a user (admin can also use /users to create)
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' });
    }
    // Check existing
    const exists = await usersCol().where('email', '==', email).limit(1).get();
    if (!exists.empty) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await usersCol().add({
      username,
      email,
      passwordHash,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const id = doc.id;
    res.status(201).json({ id, username, email });
  } catch (err) { next(err); }
});

// Login - returns JWT
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const snap = await usersCol().where('email', '==', email).limit(1).get();
    if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });
    const doc = snap.docs[0];
    const user = { id: doc.id, ...doc.data() };
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ uid: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, image: user.image } });
  } catch (err) { next(err); }
});

export default router;
