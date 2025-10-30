import { Router } from 'express';
import { db } from '../lib/firebase.js';
import requireAuth from '../middlewares/requireAuth.js';
import bcrypt from 'bcryptjs';
import upload from "../utils/uploader.js";

const router = Router();
const usersCol = () => db().collection('users');

// List users (protected)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const snap = await usersCol().get();
    const users = snap.docs.map(d => {
      const data = d.data();
      delete data.passwordHash;
      return { id: d.id, ...data };
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.get('/search', requireAuth, async (req, res, next) => {
  try {
    const q = req.query.q?.toLowerCase() || "";
    const snap = await usersCol().get();

    const results = snap.docs.map(d => ({ id:d.id, ...d.data() }))
      .filter(u => (u.username || "").toLowerCase().includes(q));

    results.forEach(u => delete u.passwordHash);
    return res.json(results);
  } catch (err) { next(err); }
});


// Get single user
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const doc = await usersCol().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const data = doc.data();
    delete data.passwordHash;
    res.json({ id: doc.id, ...data });
  } catch (err) { next(err); }
});

// Create user (admin) with optional image upload
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Default image
    let imageUrl = null;

    // If image uploaded → build local file URL
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const ref = await usersCol().add({ username, email, passwordHash, image: imageUrl});

    const doc = await ref.get();
    const data = doc.data();
    delete data.passwordHash;

    res.status(201).json({ id: doc.id, ...data });
  } catch (err) { next(err); }
});

// Update user + optional new image upload
router.put('/:id', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const updates = {}; // ✅ thêm dòng này

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    if (req.file) {
      updates.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    await usersCol().doc(req.params.id).update(updates);
    const doc = await usersCol().doc(req.params.id).get();
    const data = doc.data();
    delete data.passwordHash;
    res.json({ id: doc.id, ...data });
  } catch (err) { next(err); }
});


// Delete user
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await usersCol().doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) { next(err); }
});
// Search users
// Search users by username (case-insensitive)
// Search users by username (case-insensitive)



export default router;
