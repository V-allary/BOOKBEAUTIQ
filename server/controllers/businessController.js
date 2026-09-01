import Business from "../models/Business.js";

// ==========================================
// HELPER — GET LOGGED-IN USER ID
// ==========================================

const getUserId = (req) => {
  return req.user?.userId || req.user?.id || req.user?._id;
};

// ==========================================
// GET ALL BUSINESSES
// Used by Admin
// ==========================================

export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET PUBLIC BUSINESSES
// Used by Explore
// 
export const getApprovedBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({
      status: "approved",
      subscriptionStatus: { $in: ["trialing", "active"] },
    }).populate("owner", "verificationStatus");

    const visible = businesses.filter(
      (b) => b.owner?.verificationStatus === "verified"
    );

    res.status(200).json(visible);
  } catch (error) {
    console.error("Get approved businesses error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate(
      "owner",
      "verificationStatus"
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    if (
      business.status !== "approved" ||
      business.owner?.verificationStatus !== "verified"
    ) {
      return res.status(404).json({ message: "Business not found." });
    }

    if (business.subscriptionStatus === "suspended") {
      return res.status(403).json({
        message: "This business is currently suspended.",
        suspended: true,
      });
    }

    res.status(200).json(business);
  } catch (error) {
    console.error("Get business by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

 // ==========================================
// GET BUSINESS FOR LOGGED-IN OWNER
// Used by owner dashboard
// ==========================================

export const getBusinessForOwner = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const business = await Business.findOne({ owner: userId });

    if (!business) {
      return res.status(404).json({
        message: "No business found for this account.",
      });
    }

    res.status(200).json(business);
  } catch (error) {
    console.error("Get business for owner error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// CREATE BUSINESS
// Owner must already be a verified account
// (enforced by requireVerifiedOwner middleware)
// ==========================================

export const createBusiness = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const existingBusiness = await Business.findOne({ owner: userId });
    if (existingBusiness) {
      return res.status(400).json({
        message: "You already have a business registered. Each account can only manage one business.",
      });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const business = await Business.create({
      ...req.body,
      owner: userId,
      status: "pending",
      subscriptionPlan: req.body.subscriptionPlan === "team" ? "team" : "independent",
      subscriptionStatus: "trialing",
      trialEndsAt,
    });

    res.status(201).json({
      message: "Business submitted for review.",
      business,
    });
  } catch (error) {
    console.error("Create business error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// DELETE BUSINESS
// ==========================================

export const deleteBusiness = async (req, res) => {
  try {
    const userId = getUserId(req);

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    const isOwner =
      business.owner && userId && business.owner.toString() === userId.toString();

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only manage your own business.",
      });
    }

    await business.deleteOne();

    res.status(200).json({ message: "Business deleted successfully." });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// UPDATE BUSINESS
// ==========================================

export const updateBusiness = async (req, res) => {
  try {
    const userId = getUserId(req);

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    const isOwner =
      business.owner && userId && business.owner.toString() === userId.toString();

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only manage your own business.",
      });
    }

    // Owners cannot change protected fields.
    if (!isAdmin) {
      delete req.body.status;
    }

    // Nobody can change the owner through this route.
    delete req.body.owner;

    Object.assign(business, req.body);

    const updatedBusiness = await business.save();

    res.status(200).json(updatedBusiness);
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// APPROVE BUSINESS
// Admin platform approval
// ==========================================

export const approveBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    business.status = "approved";

    const updatedBusiness = await business.save();

    res.status(200).json({
      message: "Business approved successfully.",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Approve business error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// REJECT BUSINESS
// Admin platform rejection
// ==========================================

export const rejectBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    business.status = "rejected";

    const updatedBusiness = await business.save();

    res.status(200).json({
      message: "Business rejected successfully.",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Reject business error:", error);
    res.status(500).json({ message: error.message });
  }
};
