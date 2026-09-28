import User from "../models/User.js";

// Business owners must verify their email before they can upload
// documents, submit verification, or create a business. Customers and
// the admin pass straight through. Checked against the database on every
// call, so a stale token or a tampered localStorage can't bypass it.
const requireEmailVerified = async (req, res, next) => {
  try {
    if (req.user?.role !== "business") return next();

    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId).select("isEmailVerified");

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address to continue.",
      });
    }

    next();
  } catch (error) {
    console.error("Email verification gate error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default requireEmailVerified;