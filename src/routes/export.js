import { Router } from "express";
import { db } from "../lib/firebase.js";
import ExcelJS from "exceljs";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const snap = await db().collection("users").get();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Danh sách người dùng");

    sheet.addRow(["Username", "Email", "Image URL"]);

    snap.forEach(doc => {
      const u = doc.data();
      sheet.addRow([u.username, u.email, u.image || ""]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;   // ✅ THÊM DÒNG NÀY
