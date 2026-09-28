import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Bookings.js";
import sendEmail from "../utils/sendEmail.js";
import escapeHtml from "../utils/escapeHtml.js";
import { getSupportEmail, supportLine } from "../utils/support.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildStats = (byStatus = {}) => ({
  total: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
  completed: byStatus["Completed"] || 0,
  cancelled: byStatus["Cancelled"] || 0,
  noShows: byStatus["No-show"] || 0,
});

const LIST_FIELDS =
  "firstName lastName email phone accountStatus suspendedReason suspendedAt createdAt";

// ==========================================
// LIST CUSTOMERS
// ==========================================

export const listCustomers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const search = String(req.query.search || "").trim().slice(0, 100);
    const status = req.query.status;

    const filter = { role: "customer" };

    if (status === "suspended") filter.accountStatus = "suspended";
    else if (status === "active") filter.accountStatus = { $ne: "suspended" };

    // Every word must match somewhere, so "John Smith" finds John Smith
    const terms = search.split(/\s+/).filter(Boolean).slice(0, 5);
    if (terms.length) {
      filter.$and = terms.map((term) => {
        const rx = new RegExp(escapeRegex(term), "i");
        return {
          $or: [{ firstName: rx }, { lastName: rx }, { email: rx }, { phone: rx }],
        };
      });
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select(LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const counts = await Booking.aggregate([
      { $match: { customerId: { $in: customers.map((c) => c._id) } } },
      {
        $group: {
          _id: { customerId: "$customerId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const byCustomer = {};
    for (const row of counts) {
      const key = row._id.customerId.toString();
      byCustomer[key] ||= {};
      byCustomer[key][row._id.status] = row.count;
    }

    res.status(200).json({
      customers: customers.map((c) => ({
        ...c,
        stats: buildStats(byCustomer[c._id.toString()]),
      })),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("List customers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// CUSTOMER DETAIL
// ==========================================

export const getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    const customer = await User.findOne({ _id: id, role: "customer" });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const [bookings, statusCounts] = await Promise.all([
      Booking.find({ customerId: customer._id })
        .populate("businessId", "name")
        .sort({ createdAt: -1 })
        .limit(50),
      Booking.aggregate([
        { $match: { customerId: customer._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus = {};
    for (const row of statusCounts) byStatus[row._id] = row.count;

    res.status(200).json({
      customer,
      bookings,
      stats: buildStats(byStatus),
    });
  } catch (error) {
    console.error("Customer detail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SUSPEND
// ==========================================

export const suspendCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }
    if (reason.length < 5) {
      return res.status(400).json({ message: "Please give a reason (at least 5 characters)." });
    }
    if (reason.length > 500) {
      return res.status(400).json({ message: "Reason must be 500 characters or fewer." });
    }

    const customer = await User.findOneAndUpdate(
      { _id: id, role: "customer", accountStatus: { $ne: "suspended" } },
      {
        $set: {
          accountStatus: "suspended",
          suspendedAt: new Date(),
          suspendedReason: reason,
          suspendedBy: req.user.userId,
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found, or already suspended." });
    }

    let emailSent = true;
    try {
      await sendEmail({
        to: customer.email,
        replyTo: getSupportEmail() || undefined,
        subject: "Your BookBeautiq account has been suspended",
        html: `
          <p>Hi ${escapeHtml(customer.firstName)},</p>
          <p>Your BookBeautiq account has been suspended.</p>
          <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
          <p>While your account is suspended you can't sign in or make bookings.</p>
          <p>${supportLine()}</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send suspension email:", emailError);
      emailSent = false;
    }

    res.status(200).json({
      message: emailSent
        ? "Customer suspended and notified by email."
        : "Customer suspended, but the notification email couldn't be sent.",
      emailSent,
      customer,
    });
  } catch (error) {
    console.error("Suspend customer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// REINSTATE
// ==========================================

export const reinstateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    const customer = await User.findOneAndUpdate(
      { _id: id, role: "customer", accountStatus: "suspended" },
      {
        $set: {
          accountStatus: "approved",
          suspendedAt: null,
          suspendedReason: "",
          suspendedBy: null,
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found, or not suspended." });
    }

    let emailSent = true;
    try {
      await sendEmail({
        to: customer.email,
        replyTo: getSupportEmail() || undefined,
        subject: "Your BookBeautiq account has been reinstated",
        html: `
          <p>Hi ${escapeHtml(customer.firstName)},</p>
          <p>Your BookBeautiq account has been reinstated. You can sign in and make bookings again.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send reinstatement email:", emailError);
      emailSent = false;
    }

    res.status(200).json({
      message: emailSent
        ? "Customer reinstated and notified by email."
        : "Customer reinstated, but the notification email couldn't be sent.",
      emailSent,
      customer,
    });
  } catch (error) {
    console.error("Reinstate customer error:", error);
    res.status(500).json({ message: error.message });
  }
};