import User from "../models/User.js";

// Blocks business-role accounts from taking business actions
// until their identity + business verification is approved.
// Customers and admins pass through untouched.
const requireVerifiedOwner = async (req, res, next) => {
  try {
    if (req.user.role !== "business") return next();

    const user = await User.findById(req.user.userId);

    if (!user || user.verificationStatus !== "verified") {
      return res.status(403).json({
        message: "Your account must be verified before you can do this.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default requireVerifiedOwner;
