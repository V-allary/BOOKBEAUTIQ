import Business from "../models/Business.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";


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
    const businesses = await Business.find().populate(
      "owner",
      "firstName lastName email phone verificationStatus identityDocumentType identityDocument legalBusinessName businessRegistrationNumber businessAddress countryOfRegistration businessDocument"
    );
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

    const now = Date.now();
    const NEW_BUSINESS_WINDOW_DAYS = 21;

    const scored = visible.map((b) => {
      // Rating: 0-5 scale, weight 40
      const ratingScore = (b.avgRating || 0) * 8; // max 40

      // Completed bookings: log-scaled so it doesn't runaway, weight 25
      const bookingScore = Math.min(Math.log((b.completedBookingsCount || 0) + 1) * 8, 25);

      // Recent activity: bookings in the last 30 days score higher, weight 15
      let activityScore = 0;
      if (b.lastBookingAt) {
        const daysSinceActivity = (now - new Date(b.lastBookingAt).getTime()) / 86400000;
        activityScore = Math.max(15 - daysSinceActivity / 2, 0);
      }

      // Profile completeness, weight 15
      let completenessScore = 0;
      if (b.image) completenessScore += 5;
      if (Array.isArray(b.gallery) && b.gallery.length > 0) completenessScore += 4;
      if (b.description && b.description.length > 50) completenessScore += 4;
      if (b.openingHours) completenessScore += 2;

      let score = ratingScore + bookingScore + activityScore + completenessScore;

      // New business boost — guarantee a competitive floor for the first few weeks
      const daysSinceJoined = (now - new Date(b.createdAt).getTime()) / 86400000;
      const isNew = daysSinceJoined <= NEW_BUSINESS_WINDOW_DAYS;
      if (isNew) {
        score = Math.max(score, 50);
      }

      // Light randomization so it's not a rigid static leaderboard
      score += Math.random() * 5;

      return { business: b, score };
    });

    scored.sort((a, b) => b.score - a.score);

    res.status(200).json(scored.map((s) => s.business));
  } catch (error) {
    console.error("Get approved businesses error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SEARCH BUSINESSES
// Used by Home hero search + Explore filters
// ==========================================

export const searchBusinesses = async (req, res) => {
  try {
    const { q, location, category, minPrice, maxPrice, topRated } = req.query;

    const businesses = await Business.find({
      status: "approved",
      subscriptionStatus: { $in: ["trialing", "active"] },
    }).populate("owner", "verificationStatus");

    let visible = businesses.filter(
      (b) => b.owner?.verificationStatus === "verified"
    );

    // Location filter — matches business's stored location text
    if (location) {
      const locationLower = location.toLowerCase();
      visible = visible.filter((b) =>
        b.location?.toLowerCase().includes(locationLower)
      );
    }

    // Category filter
    if (category) {
      visible = visible.filter(
        (b) => b.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Top rated filter — 4.5+ average rating
    if (topRated === "true") {
      visible = visible.filter((b) => (b.avgRating || 0) >= 4.5);
    }

    // Text search — matches business name/category/description, AND any service they offer
    if (q && q.trim()) {
      const searchTerm = q.trim();
      const regex = new RegExp(searchTerm, "i");

      const matchingServices = await Service.find({ name: regex }).select("businessId");
      const matchingBusinessIds = new Set(matchingServices.map((s) => s.businessId.toString()));

      visible = visible.filter((b) => {
        const matchesBusinessFields =
          regex.test(b.name || "") ||
          regex.test(b.category || "") ||
          regex.test(b.description || "");

        const matchesService = matchingBusinessIds.has(b._id.toString());

        return matchesBusinessFields || matchesService;
      });
    }

    // Price filter — checks the business's services, not just the "starting price" text field
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;

      const businessIds = visible.map((b) => b._id);
      const servicesInRange = await Service.find({
        businessId: { $in: businessIds },
        price: { $gte: min, $lte: max },
      }).select("businessId");

      const idsWithMatchingPrice = new Set(
        servicesInRange.map((s) => s.businessId.toString())
      );

      visible = visible.filter((b) => idsWithMatchingPrice.has(b._id.toString()));
    }

    res.status(200).json(visible);
  } catch (error) {
    console.error("Search businesses error:", error);
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

    business.profileViews = (business.profileViews || 0) + 1;
    await business.save();

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

    if (!business.paystackSubaccountCode) {
      return res.status(400).json({
        message: "This business must link a payout account (bank or M-Pesa) before it can be approved.",
      });
    }

    business.status = "approved";

    const updatedBusiness = await business.save();

    const owner = await User.findById(business.owner);
    if (owner) {
      await notify({
        userId: owner._id,
        type: "business_approved",
        title: "Your business is live!",
        message: `${business.name} has been approved and is now visible to customers.`,
        email: owner.email,
        link: "/dashboard",
      });
    }


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

    const owner = await User.findById(business.owner);
    if (owner) {
      await notify({
        userId: owner._id,
        type: "business_rejected",
        title: "Business listing not approved",
        message: `${business.name} was not approved. Please review your listing details.`,
        email: owner.email,
        link: "/dashboard",
      });
    }


    res.status(200).json({
      message: "Business rejected successfully.",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Reject business error:", error);
    res.status(500).json({ message: error.message });
  }
};
