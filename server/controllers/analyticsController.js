import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import User from "../models/User.js";

export const getBusinessAnalytics = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own business's analytics." });
    }

    const businessObjectId = business._id;

    // ==========================================
    // MONTHLY BREAKDOWN — since they joined
    // ==========================================

    const monthly = await Booking.aggregate([
      { $match: { businessId: businessObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ["$depositPaid", true] }, "$depositAmount", 0] },
          },
          customers: { $addToSet: "$customerEmail" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          bookings: 1,
          revenue: 1,
          customers: { $size: "$customers" },
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // ==========================================
    // ALL-TIME TOTALS
    // ==========================================

    const totalBookings = await Booking.countDocuments({ businessId: businessObjectId });

    const revenueAgg = await Booking.aggregate([
      { $match: { businessId: businessObjectId, depositPaid: true } },
      { $group: { _id: null, total: { $sum: "$depositAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const uniqueCustomers = await Booking.distinct("customerEmail", { businessId: businessObjectId });

    // ==========================================
    // POPULAR SERVICES
    // ==========================================

    const popularServices = await Booking.aggregate([
      { $match: { businessId: businessObjectId } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { service: "$_id", count: 1, _id: 0 } },
    ]);
    const savedCount = await User.countDocuments({ savedBusinesses: businessObjectId });

    res.status(200).json({
      totals: {
        bookings: totalBookings,
        revenue: totalRevenue,
        customers: uniqueCustomers.length,
      },
      profileViews: business.profileViews || 0,
      savedByCustomers: savedCount,
      popularServices,
      monthly,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
