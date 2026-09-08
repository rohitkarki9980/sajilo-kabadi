import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "sajilo.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  phone TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 1,
  rating REAL NOT NULL DEFAULT 4.8,
  recycled_kg REAL NOT NULL DEFAULT 0,
  wallet_balance INTEGER NOT NULL DEFAULT 0,
  earned_this_year INTEGER NOT NULL DEFAULT 0,
  pickups_done INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbr TEXT NOT NULL,
  price INTEGER NOT NULL,
  trend TEXT NOT NULL,
  up INTEGER NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  day TEXT NOT NULL,
  slot TEXT NOT NULL,
  haul TEXT NOT NULL,
  haul_cost INTEGER NOT NULL,
  cart_json TEXT NOT NULL,
  cart_kg REAL NOT NULL,
  cart_value INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  net_total INTEGER NOT NULL,
  collector_name TEXT NOT NULL DEFAULT 'Ram Tamang',
  collector_plate TEXT NOT NULL DEFAULT 'Ba 2 Kha 4821',
  pay_method TEXT NOT NULL DEFAULT 'wallet',
  weigh_json TEXT,
  weigh_total INTEGER,
  weigh_kg REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  date TEXT NOT NULL,
  method TEXT NOT NULL,
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dropoff_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meta TEXT NOT NULL,
  tag1 TEXT NOT NULL,
  tag2 TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  dist TEXT NOT NULL,
  items TEXT NOT NULL,
  value INTEGER NOT NULL,
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  seller_name TEXT NOT NULL DEFAULT 'Bina Shrestha',
  seller_rating REAL NOT NULL DEFAULT 4.8,
  margin INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS job_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kg TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  ask INTEGER NOT NULL,
  meta TEXT NOT NULL,
  tint TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kg REAL NOT NULL,
  worth INTEGER NOT NULL
);
`);

export function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (userCount.c > 0) return;

  const insertUser = db.prepare(`INSERT INTO users
    (id, name, initials, phone, area, address, verified, rating, recycled_kg, wallet_balance, earned_this_year, pickups_done)
    VALUES (@id,@name,@initials,@phone,@area,@address,@verified,@rating,@recycled_kg,@wallet_balance,@earned_this_year,@pickups_done)`);
  insertUser.run({
    id: "u_bina", name: "Bina Shrestha", initials: "BS", phone: "+977 98•••• 4471",
    area: "Jhamsikhel", address: "Jhamsikhel, Lalitpur — Ward 3, house 42",
    verified: 1, rating: 4.8, recycled_kg: 312, wallet_balance: 4280,
    earned_this_year: 12940, pickups_done: 18
  });

  const materials: [string, string, string, number, string, number, string][] = [
    // metals
    ["m_cu", "Copper", "Cu", 900, "+4%", 1, "metal"],
    ["m_bz", "Bronze", "Bz", 720, "+3%", 1, "metal"],
    ["m_br", "Brass", "Br", 640, "+1%", 1, "metal"],
    ["m_pb", "Lead", "Pb", 210, "0%", 1, "metal"],
    ["m_zn", "Zinc", "Zn", 175, "+1%", 1, "metal"],
    ["m_al", "Aluminium", "Al", 165, "+2%", 1, "metal"],
    ["m_ss", "Stainless steel", "SS", 130, "+2%", 1, "metal"],
    ["m_fe", "Iron & steel", "Fe", 48, "+1%", 1, "metal"],
    // other scrap
    ["m_bt", "Batteries", "Bt", 120, "−2%", 0, "other"],
    ["m_ew", "E-waste", "E", 60, "0%", 1, "other"],
    ["m_ap", "Appliances", "Ap", 55, "+3%", 1, "other"],
    ["m_ty", "Tyres", "Ty", 40, "0%", 1, "other"],
    ["m_rb", "Rubber", "Rb", 25, "0%", 1, "other"],
    ["m_wd", "Wood", "Wd", 10, "−1%", 0, "other"],
    // paper & plastic
    ["m_pet", "Plastic (PET)", "PET", 30, "−1%", 0, "paper-plastic"],
    ["m_hdpe", "Plastic (HDPE)", "HDPE", 35, "+1%", 1, "paper-plastic"],
    ["m_np", "Newspaper", "Np", 22, "+2%", 1, "paper-plastic"],
    ["m_mp", "Mixed paper", "MP", 16, "0%", 1, "paper-plastic"],
    ["m_cb", "Cardboard", "Cb", 14, "0%", 1, "paper-plastic"],
    ["m_gl", "Glass", "Gl", 8, "0%", 1, "paper-plastic"]
  ];
  const insertMat = db.prepare(`INSERT INTO materials (id,name,abbr,price,trend,up,category) VALUES (?,?,?,?,?,?,?)`);
  for (const m of materials) insertMat.run(...m);

  const insertCenter = db.prepare(`INSERT INTO dropoff_centers (id,name,meta,tag1,tag2) VALUES (?,?,?,?,?)`);
  insertCenter.run("c1", "Jhamsikhel Kabadi Store", "0.6 km · Ward 3 · till 6 pm", "All materials", "Weighs on site");
  insertCenter.run("c2", "Doko Recyclers hub", "1.8 km · Sanepa · till 5 pm", "E-waste", "Card payment");
  insertCenter.run("c3", "Bagmati Metal Traders", "2.1 km · Kupondole · till 7 pm", "Metals only", "Best copper rate");

  const insertJob = db.prepare(`INSERT INTO jobs (id,area,dist,items,value,slot,margin) VALUES (?,?,?,?,?,?,?)`);
  insertJob.run("j1", "Jhamsikhel, Ward 3", "1.2 km", "Newspaper, iron, PET, cardboard · approx. 26 kg", 1120, "10:30 am", 240);
  insertJob.run("j2", "Sanepa, Ward 2", "2.4 km", "Two old fridges, mixed metal · approx. 70 kg", 3400, "1:00 pm", 640);
  insertJob.run("j3", "Kupondole", "3.1 km", "Office e-waste, 12 monitors", 2250, "4:00 pm", 410);

  const insertJobItem = db.prepare(`INSERT INTO job_items (job_id,name,kg) VALUES (?,?,?)`);
  for (const it of [["j1", "Newspaper", "~9 kg"], ["j1", "Iron & steel", "~11 kg"], ["j1", "Plastic (PET)", "~4 kg"], ["j1", "Cardboard", "~5 kg"]]) {
    insertJobItem.run(it[0], it[1], it[2]);
  }

  const insertListing = db.prepare(`INSERT INTO listings (id,title,ask,meta,tint) VALUES (?,?,?,?,?)`);
  insertListing.run("l1", "Mixed metal, 70 kg", 3400, "Sanepa · listed 20 min ago · 3 offers", "#e1eecc");
  insertListing.run("l2", "12 monitors + cables", 2250, "Kupondole · listed today · 1 offer", "#fbe3dc");
  insertListing.run("l3", "Cardboard bales, 120 kg", 1600, "Thapathali · listed yesterday", "#eee7db");

  const insertStock = db.prepare(`INSERT INTO stock (name,kg,worth) VALUES (?,?,?)`);
  insertStock.run("Iron & steel", 210, 10080);
  insertStock.run("Newspaper", 96, 2112);
  insertStock.run("Copper", 7, 6300);
  insertStock.run("PET", 58, 1740);

  const insertPayout = db.prepare(`INSERT INTO payouts (id,user_id,label,date,method,amount,direction) VALUES (?,?,?,?,?,?,?)`);
  insertPayout.run("p1", "u_bina", "Pickup · 29.3 kg", "15 Bhadra", "Wallet", 1142, "in");
  insertPayout.run("p2", "u_bina", "Withdraw to Nabil Bank", "12 Bhadra", "Bank", 3000, "out");
  insertPayout.run("p3", "u_bina", "Pickup · 14.0 kg", "8 Bhadra", "Cash", 620, "in");
  insertPayout.run("p4", "u_bina", "Pickup · 41.5 kg", "1 Bhadra", "Wallet", 2180, "in");
  insertPayout.run("p5", "u_bina", "E-waste drop-off", "26 Shrawan", "Wallet", 480, "in");

  const insertBooking = db.prepare(`INSERT INTO bookings
    (id,user_id,status,day,slot,haul,haul_cost,cart_json,cart_kg,cart_value,fee,net_total,weigh_json,weigh_total,weigh_kg)
    VALUES (@id,@user_id,@status,@day,@slot,@haul,@haul_cost,@cart_json,@cart_kg,@cart_value,@fee,@net_total,@weigh_json,@weigh_total,@weigh_kg)`);
  const weighRows = [
    { name: "Newspaper", price: 22, kg: 9.4 },
    { name: "Iron & steel", price: 48, kg: 11.2 },
    { name: "Plastic (PET)", price: 30, kg: 3.6 },
    { name: "Cardboard", price: 14, kg: 5.1 }
  ];
  const weighTotal = Math.round(weighRows.reduce((a, r) => a + r.price * r.kg, 0));
  const weighKg = weighRows.reduce((a, r) => a + r.kg, 0);
  insertBooking.run({
    id: "KB-2481", user_id: "u_bina", status: "on_the_way", day: "Sun 10", slot: "10:30 – 11:00",
    haul: "collector", haul_cost: 0,
    cart_json: JSON.stringify([{ name: "Iron & steel", kg: 10, price: 48 }, { name: "Aluminium", kg: 4, price: 165 }]),
    cart_kg: 14, cart_value: 10 * 48 + 4 * 165, fee: Math.round((10 * 48 + 4 * 165) * 0.02),
    net_total: (10 * 48 + 4 * 165) - Math.round((10 * 48 + 4 * 165) * 0.02),
    weigh_json: JSON.stringify(weighRows), weigh_total: weighTotal, weigh_kg: weighKg
  });
}

seedIfEmpty();
