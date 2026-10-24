import User from "../models/User.js";
import { ensureReferralCode, getReferralStats } from "../utils/referrals.js";

export const getMyReferral = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "business") {
      return res.status(403).json({ message: "Referrals are for business owners." });
    }

    const code = await ensureReferralCode(userId);
    const stats = await getReferralStats(userId);

    res.status(200).json({
      code,
      link: `${process.env.CLIENT_URL}/signup?ref=${code}`,
      ...stats,
    });
  } catch (error) {
    console.error("Referral info error:", error);
    res.status(500).json({ message: "Could not load referral info." });
  }
};