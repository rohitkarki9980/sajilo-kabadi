import express from "express";
import cors from "cors";
import "./db.js";
import { ratesRouter } from "./routes/rates.js";
import { homeRouter } from "./routes/home.js";
import { walletRouter } from "./routes/wallet.js";
import { impactRouter } from "./routes/impact.js";
import { dropoffRouter } from "./routes/dropoff.js";
import { bookingsRouter } from "./routes/bookings.js";
import { collectorRouter } from "./routes/collector.js";
import { profileRouter } from "./routes/profile.js";
import { authRouter } from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/rates", ratesRouter);
app.use("/api/home", homeRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/impact", impactRouter);
app.use("/api/dropoff-centers", dropoffRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/collector", collectorRouter);
app.use("/api/profile", profileRouter);
app.use("/api/auth", authRouter);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Sajilo Kabadi API listening on http://localhost:${PORT}`);
});
