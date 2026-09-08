import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";

export const authRouter = Router();

// Prototype-parity mock auth: no OTP/password verification, matching the
// design's "Send me a code" flow which just signs the demo user in.
authRouter.post("/signin", (req, res) => {
  const role = req.body?.role === "collector" ? "collector" : "seller";
  const u = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  res.json({
    token: randomUUID(),
    role,
    user: { name: u.name, initials: u.initials, phone: u.phone, area: u.area }
  });
});

authRouter.post("/signout", (_req, res) => {
  res.json({ ok: true });
});
