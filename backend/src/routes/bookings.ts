import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";

export const bookingsRouter = Router();

const DIST_KM = 2.4;
const SERVICE_FEE_RATE = 0.02;

type HaulId = "self" | "collector" | "truck";

function haulCostFor(id: HaulId, cartKg: number): number {
  if (id === "self") return 0;
  if (id === "collector") return cartKg >= 10 ? 0 : 60;
  return Math.round(400 + 30 * DIST_KM);
}

function priceItems(items: { name: string; kg: number }[]) {
  const rows = items.map((it) => {
    const mat = db.prepare("SELECT * FROM materials WHERE name = ?").get(it.name) as any;
    if (!mat) throw new Error(`Unknown material: ${it.name}`);
    const kg = Math.max(0, it.kg);
    return { name: it.name, kg, price: mat.price, amount: Math.round(kg * mat.price) };
  });
  const cartKg = rows.reduce((a, r) => a + r.kg, 0);
  const cartValue = rows.reduce((a, r) => a + r.amount, 0);
  return { rows, cartKg, cartValue };
}

// Quote a cart + haul choice without persisting anything.
bookingsRouter.post("/quote", (req, res) => {
  try {
    const items = (req.body?.items ?? []) as { name: string; kg: number }[];
    const haul = (req.body?.haul ?? "collector") as HaulId;
    const { rows, cartKg, cartValue } = priceItems(items);
    const haulCost = haulCostFor(haul, cartKg);
    const fee = Math.round(cartValue * SERVICE_FEE_RATE);
    const netTotal = Math.max(0, cartValue - haulCost - fee);
    res.json({
      lines: rows, cartKg, cartValue, haulCost, fee, netTotal, distanceKm: DIST_KM,
      haulOptions: (["self", "collector", "truck"] as HaulId[]).map((id) => ({ id, cost: haulCostFor(id, cartKg) }))
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

bookingsRouter.post("/", (req, res) => {
  try {
    const items = (req.body?.items ?? []) as { name: string; kg: number }[];
    const day = String(req.body?.day ?? "");
    const slot = String(req.body?.slot ?? "");
    const haul = (req.body?.haul ?? "collector") as HaulId;
    if (!items.length) return res.status(400).json({ error: "Cart is empty" });

    const { rows, cartKg, cartValue } = priceItems(items);
    const haulCost = haulCostFor(haul, cartKg);
    const fee = Math.round(cartValue * SERVICE_FEE_RATE);
    const netTotal = Math.max(0, cartValue - haulCost - fee);
    const id = "KB-" + Math.floor(1000 + Math.random() * 9000);

    // The collector's on-site scale settles the final weight; seed the
    // weigh-in sheet from the booked cart so the two screens agree.
    const weighTotal = cartValue;

    db.prepare(`INSERT INTO bookings
      (id,user_id,status,day,slot,haul,haul_cost,cart_json,cart_kg,cart_value,fee,net_total,weigh_json,weigh_total,weigh_kg)
      VALUES (@id,@user_id,@status,@day,@slot,@haul,@haul_cost,@cart_json,@cart_kg,@cart_value,@fee,@net_total,@weigh_json,@weigh_total,@weigh_kg)`
    ).run({
      id, user_id: "u_bina", status: "on_the_way", day, slot, haul, haul_cost: haulCost,
      cart_json: JSON.stringify(rows), cart_kg: cartKg, cart_value: cartValue, fee, net_total: netTotal,
      weigh_json: JSON.stringify(rows), weigh_total: weighTotal, weigh_kg: cartKg
    });

    res.json({ id, cartKg, cartValue, haulCost, fee, netTotal, status: "on_the_way" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

function getBooking(id: string) {
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
}

bookingsRouter.get("/:id", (req, res) => {
  const b = getBooking(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json({
    id: b.id, status: b.status, day: b.day, slot: b.slot,
    collectorName: b.collector_name, collectorPlate: b.collector_plate,
    cart: JSON.parse(b.cart_json), cartKg: b.cart_kg, cartValue: b.cart_value,
    haul: b.haul, haulCost: b.haul_cost, fee: b.fee, netTotal: b.net_total
  });
});

bookingsRouter.get("/:id/track", (req, res) => {
  const b = getBooking(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  const weighed = b.status === "paid" || b.status === "weighing";
  res.json({
    collectorName: b.collector_name, collectorPlate: b.collector_plate,
    steps: [
      { label: "Pickup confirmed", time: "9:02", done: true },
      { label: `${b.collector_name.split(" ")[0]} accepted the job`, time: "9:14", done: true },
      { label: "On the way to you", time: "now", done: true },
      { label: "Weighing & payment", time: weighed ? "done" : "—", done: weighed }
    ]
  });
});

bookingsRouter.get("/:id/weigh", (req, res) => {
  const b = getBooking(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json({ rows: JSON.parse(b.weigh_json ?? "[]"), total: b.weigh_total, kg: b.weigh_kg });
});

bookingsRouter.post("/:id/payout", (req, res) => {
  const b = getBooking(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  const method = String(req.body?.method ?? "wallet") as "wallet" | "cash" | "bank";

  db.prepare("UPDATE bookings SET status = 'paid', pay_method = ? WHERE id = ?").run(method, b.id);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(b.user_id) as any;
  const newBalance = method === "wallet" ? user.wallet_balance + b.weigh_total : user.wallet_balance;
  db.prepare(`UPDATE users SET wallet_balance = ?, earned_this_year = earned_this_year + ?, pickups_done = pickups_done + 1, recycled_kg = recycled_kg + ? WHERE id = ?`)
    .run(newBalance, b.weigh_total, b.weigh_kg, user.id);

  const methodLabel = method === "wallet" ? "Wallet" : method === "cash" ? "Cash" : "Bank";
  db.prepare("INSERT INTO payouts (id,user_id,label,date,method,amount,direction) VALUES (?,?,?,?,?,?,?)")
    .run(randomUUID(), user.id, `Pickup · ${b.weigh_kg} kg`, "Today", methodLabel, b.weigh_total, "in");

  res.json({ status: "paid", method, amount: b.weigh_total, walletBalance: newBalance });
});
