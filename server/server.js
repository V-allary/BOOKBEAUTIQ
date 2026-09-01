import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
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


dotenv.config();

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


app.use(cors({
  origin: ["http://localhost:5173"], // your Vite dev URL — add your real domain when you deploy
  credentials: true,
}));


app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use(express.json());


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);



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