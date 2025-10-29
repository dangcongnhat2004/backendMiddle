import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config.js';
import { initFirebase } from './lib/firebase.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import chatRouter from "./routes/chat.js";

const app = express(); // ✅ khai báo app TRƯỚC
const PORT = process.env.PORT || 8080;

// Initialize Firebase
initFirebase();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use("/chat", chatRouter);   // ✅ ĐÚNG VỊ TRÍ ở đây

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ API running at: http://192.168.1.11:${PORT}`);
});
