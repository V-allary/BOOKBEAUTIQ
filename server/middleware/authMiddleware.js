import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  try {
    const userId = decoded.userId || decoded.id || decoded._id;
    const user = await User.findById(userId).select("role accountStatus");

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        code: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended.",
      });
    }

    // Role comes from the database, so a stale token can't keep old privileges
    req.user = { ...decoded, userId: String(user._id), role: user.role };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export default authMiddleware;