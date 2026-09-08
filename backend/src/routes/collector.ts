import { Router } from "express";
import { db } from "../db.js";

export const collectorRouter = Router();

collectorRouter.get("/home", (_req, res) => {
  const openJobs = db.prepare("SELECT * FROM jobs WHERE status = 'open'").all() as any[];
  res.json({
    todaysBuying: 3150,
    kgToday: 142,
    pickupsToday: 6,
    accepting: true,
    area: "Lalitpur",
    openJobCount: openJobs.length
  });
});

collectorRouter.get("/jobs", (_req, res) => {
  const jobs = db.prepare("SELECT * FROM jobs WHERE status = 'open'").all() as any[];
  res.json({
    jobs: jobs.map((j) => ({ id: j.id, area: j.area, dist: j.dist, items: j.items, value: j.value, slot: j.slot }))
  });
});

collectorRouter.get("/jobs/:id", (req, res) => {
  const j = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id) as any;
  if (!j) return res.status(404).json({ error: "Not found" });
  const items = db.prepare("SELECT name, kg FROM job_items WHERE job_id = ?").all(j.id) as any[];
  res.json({
    id: j.id, area: j.area, dist: j.dist, value: j.value, slot: j.slot, status: j.status,
    sellerName: j.seller_name, sellerRating: j.seller_rating, margin: j.margin, items
  });
});

collectorRouter.post("/jobs/:id/accept", (req, res) => {
  const j = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id) as any;
  if (!j) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE jobs SET status = 'accepted' WHERE id = ?").run(j.id);
  res.json({ id: j.id, status: "accepted" });
});

collectorRouter.get("/earnings", (_req, res) => {
  const stock = db.prepare("SELECT name, kg, worth FROM stock").all() as any[];
  res.json({
    thisWeek: 18400,
    changePct: 12,
    bars: [
      { day: "Sun", pct: 38 }, { day: "Mon", pct: 62 }, { day: "Tue", pct: 44 },
      { day: "Wed", pct: 78 }, { day: "Thu", pct: 56 }, { day: "Fri", pct: 92 }, { day: "Sat", pct: 70 }
    ],
    stock
  });
});

collectorRouter.get("/marketplace", (_req, res) => {
  const listings = db.prepare("SELECT * FROM listings").all() as any[];
  res.json({
    listings: listings.map((l) => ({ id: l.id, title: l.title, ask: l.ask, meta: l.meta, tint: l.tint }))
  });
});
