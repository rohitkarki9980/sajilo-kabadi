import { Router } from "express";
import { db } from "../db.js";

export const profileRouter = Router();

profileRouter.get("/", (_req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  res.json({
    name: u.name, initials: u.initials, phone: u.phone, area: u.area, address: u.address,
    verified: !!u.verified, rating: u.rating, recycledKg: u.recycled_kg
  });
});
