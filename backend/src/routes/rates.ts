import { Router } from "express";
import { db } from "../db.js";

export const ratesRouter = Router();

function mapRate(r: any) {
  return { id: r.id, name: r.name, abbr: r.abbr, price: r.price, trend: r.trend, up: !!r.up, category: r.category };
}

ratesRouter.get("/", (req, res) => {
  const filter = String(req.query.filter || "All");
  let rows: any[];
  if (filter === "Metal") rows = db.prepare("SELECT * FROM materials WHERE category = 'metal' ORDER BY price DESC").all();
  else if (filter === "Paper & plastic") rows = db.prepare("SELECT * FROM materials WHERE category = 'paper-plastic' ORDER BY price DESC").all();
  else rows = db.prepare("SELECT * FROM materials ORDER BY price DESC").all();
  res.json({ rates: rows.map(mapRate) });
});

ratesRouter.get("/top", (_req, res) => {
  const rows = db.prepare("SELECT * FROM materials ORDER BY price DESC LIMIT 5").all();
  res.json({ rates: rows.map(mapRate) });
});
