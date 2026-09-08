import { Router } from "express";
import { db } from "../db.js";

export const impactRouter = Router();

impactRouter.get("/", (_req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  res.json({
    totalKg: user.recycled_kg,
    since: "Baisakh",
    cards: [
      { value: "1.2 t", label: "CO₂e avoided, about a Pokhara flight", tone: "green" },
      { value: String(user.pickups_done), label: "pickups from your door", tone: "red" },
      { value: `Rs ${user.earned_this_year.toLocaleString()}`, label: "earned from what you'd have thrown", tone: "neutral" },
      { value: "#4", label: "in Jhamsikhel this month", tone: "neutral" }
    ],
    bars: [
      { name: "Paper & cardboard", kg: 128, pct: 92, tone: "green" },
      { name: "Iron & steel", kg: 74, pct: 58, tone: "olive" },
      { name: "Plastic", kg: 61, pct: 46, tone: "red" },
      { name: "E-waste & metals", kg: 49, pct: 36, tone: "amber" }
    ]
  });
});
