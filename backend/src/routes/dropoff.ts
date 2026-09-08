import { Router } from "express";
import { db } from "../db.js";

export const dropoffRouter = Router();

dropoffRouter.get("/", (_req, res) => {
  const centers = db.prepare("SELECT * FROM dropoff_centers").all() as any[];
  res.json({ centers: centers.map((c) => ({ id: c.id, name: c.name, meta: c.meta, tag1: c.tag1, tag2: c.tag2 })) });
});
