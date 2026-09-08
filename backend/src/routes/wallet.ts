import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";

export const walletRouter = Router();

walletRouter.get("/", (_req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  const history = db.prepare("SELECT * FROM payouts WHERE user_id = ? ORDER BY created_at DESC").all(user.id) as any[];
  res.json({
    balance: user.wallet_balance,
    earnedThisYear: user.earned_this_year,
    pickupsDone: user.pickups_done,
    history: history.map((h) => ({
      id: h.id, label: h.label, date: h.date, method: h.method,
      amount: h.direction === "in" ? h.amount : -h.amount, direction: h.direction
    }))
  });
});

walletRouter.post("/withdraw", (req, res) => {
  const amount = Number(req.body?.amount) || 0;
  const user = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  if (amount <= 0 || amount > user.wallet_balance) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }
  const newBalance = user.wallet_balance - amount;
  db.prepare("UPDATE users SET wallet_balance = ? WHERE id = ?").run(newBalance, user.id);
  db.prepare(
    "INSERT INTO payouts (id,user_id,label,date,method,amount,direction) VALUES (?,?,?,?,?,?,?)"
  ).run(randomUUID(), user.id, "Withdraw to Nabil Bank", "Today", "Bank", amount, "out");
  res.json({ balance: newBalance });
});
