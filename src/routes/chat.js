import { Router } from "express";
import { db } from "../lib/firebase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Model đúng chuẩn (AI Studio yêu cầu prefix "models/")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Thiếu message !" });

    const msg = message.toLowerCase();

    // 🎯 Trả lời số user trong hệ thống
    if (msg.includes("bao nhieu") && msg.includes("user")) {
      const snap = await db().collection("users").get();
      return res.json({ reply: `Hệ thống hiện có ${snap.size} người dùng.` });
    }

    // 🎯 Trả lời số user tạo hôm nay
    if (msg.includes("hom nay") && msg.includes("user")) {
      const today = new Date().toISOString().slice(0, 10);
      const snap = await db()
        .collection("users")
        .where("createdAt", ">=", today)
        .get();
      return res.json({ reply: `Hôm nay đã có ${snap.size} user được tạo.` });
    }

    // 🤖 Chat AI bình thường
    const result = await model.generateContent(message);
    const replyText = result.response.text();

    res.json({ reply: replyText });

  } catch (err) {
    console.error("❌ Chat error:", err);
    res.json({ reply: "Tôi đang gặp sự cố xử lý. Thử lại nha 😢" });
  }
});

export default router;
