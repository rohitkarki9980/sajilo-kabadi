import { Router } from "express";
import { db } from "../db.js";

export const homeRouter = Router();

homeRouter.get("/", (_req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = 'u_bina'").get() as any;
  const topRates = db.prepare("SELECT * FROM materials ORDER BY price DESC LIMIT 5").all() as any[];
  const nextBooking = db.prepare(
    "SELECT * FROM bookings WHERE user_id = ? AND status = 'on_the_way' ORDER BY created_at DESC LIMIT 1"
  ).get(user.id) as any;

  let nextPickup = null;
  if (nextBooking) {
    const cart = JSON.parse(nextBooking.cart_json) as { name: string; kg: number }[];
    nextPickup = {
      bookingId: nextBooking.id,
      collectorName: nextBooking.collector_name,
      day: nextBooking.day,
      slot: nextBooking.slot,
      itemsCount: cart.length,
      approxKg: nextBooking.cart_kg
    };
  }

  const centerCount = (db.prepare("SELECT COUNT(*) as c FROM dropoff_centers").get() as any).c;

  res.json({
    name: user.name.split(" ")[0],
    walletBalance: user.wallet_balance,
    topRates: topRates.map((r) => ({ id: r.id, name: r.name, price: r.price, trend: r.trend, up: !!r.up })),
    nextPickup,
    dropoffSummary: { count: centerCount, distanceKm: 2, openTill: "6 pm" }
  });
});
