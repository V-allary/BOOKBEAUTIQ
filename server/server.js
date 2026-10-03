import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import helmet from "helmet";
import connectDB from "./config/db.js";
import businessRoutes from "./routes/businessRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/uploadRoutes.js";
import rateLimit from "express-rate-limit";
import bookingRoutes from "./routes/bookingRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import { paystackWebhook } from "./controllers/paymentController.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import subscriptionRoutes from"./routes/subscriptionRoutes.js";
import checkSubscriptions from "./utils/checkSubscriptions.js";
import checkReminders from "./utils/checkReminders.js";
import autoChargeSubscriptions from "./utils/autoChargeSubscriptions.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import savedBusinessRoutes from "./routes/savedBusinessRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";import reportRoutes from "./routes/reportRoutes.js";
import runSubscriptionCheck from "./jobs/subscriptionCheck.js";
import platformReviewRoutes from "./routes/platformReviewRoutes.js";


cron.schedule("0 9 * * *", checkReminders); 
cron.schedule("0 1 * * *", autoChargeSubscriptions);


dotenv.config();

connectDB();

const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());


app.post("/api/internal/subscription-check", async (req, res) => {
  const providedSecret = req.headers["x-internal-secret"];

  if (!process.env.INTERNAL_JOB_SECRET || providedSecret !== process.env.INTERNAL_JOB_SECRET) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    await runSubscriptionCheck();
    res.status(200).json({ message: "Subscription check completed." });
  } catch (error) {
    console.error("Subscription check job error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(cors({
  origin: ["http://localhost:5173", "https://v-allary.github.io", "https://bookbeautiq.com", "https://www.bookbeautiq.com"],
  credentials: true,
}));


app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);

app.use(express.json());


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);


app.use("/api/platform-reviews", platformReviewRoutes);


// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "BookBeautiq API is running 🚀",
  });
});

// API Routes
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/saved-businesses", savedBusinessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);


app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You have access to this protected route.",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});