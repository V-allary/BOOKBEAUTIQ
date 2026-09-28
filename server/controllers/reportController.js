import mongoose from "mongoose";
import Report, { REPORT_CATEGORIES } from "../models/Report.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import sendEmail from "../utils/sendEmail.js";
import escapeHtml from "../utils/escapeHtml.js";
import { getSupportEmail } from "../utils/support.js";

const TOKEN_PATTERN = /^[a-f0-9]{48}$/;
const REPORTABLE_STATUSES = ["Confirmed", "Completed", "No-show"];
const STATUS_FILTERS = ["open", "resolved", "dismissed"];

const categoryLabel = (key) => REPORT_CATEGORIES[key] || key;
const oneLine = (value = "") => String(value).replace(/[\r\n]+/g, " ");
const invalidLink = (res) =>
  res.status(404).json({ message: "This link isn't valid." });

// ==========================================
// PUBLIC — report page context (by private link)
// ==========================================

export const getReportContext = async (req, res) => {
  try {
    const { token } = req.params;
    if (!TOKEN_PATTERN.test(token)) return invalidLink(res);

    const booking = await Booking.findOne({ reportToken: token });
    if (!booking) return invalidLink(res);

    const [business, existing] = await Promise.all([
      Business.findById(booking.businessId).select("name"),
      Report.exists({ bookingId: booking._id }),
    ]);

    res.status(200).json({
      booking: {
        businessName: business?.name || "this business",
        service: booking.service,
        staff: booking.staff,
        date: booking.date,
        time: booking.time,
        status: booking.status,
      },
      reportable: REPORTABLE_STATUSES.includes(booking.status),
      alreadyReported: !!existing,
      categories: Object.entries(REPORT_CATEGORIES).map(([value, label]) => ({
        value,
        label,
      })),
    });
  } catch (error) {
    console.error("Report context error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ==========================================
// PUBLIC — submit a report
// ==========================================

export const submitReport = async (req, res) => {
  try {
    const token = String(req.body?.token || "");
    const category = String(req.body?.category || "");
    const description = String(req.body?.description || "").trim();

    if (!TOKEN_PATTERN.test(token)) return invalidLink(res);

    if (!Object.hasOwn(REPORT_CATEGORIES, category)) {
      return res.status(400).json({ message: "Please choose what went wrong." });
    }
    if (description.length < 10) {
      return res
        .status(400)
        .json({ message: "Please describe what happened (at least 10 characters)." });
    }
    if (description.length > 1000) {
      return res
        .status(400)
        .json({ message: "Please keep your description under 1000 characters." });
    }

    const booking = await Booking.findOne({ reportToken: token });
    if (!booking) return invalidLink(res);

    if (!REPORTABLE_STATUSES.includes(booking.status)) {
      return res.status(400).json({ message: "This booking can't be reported." });
    }

    if (await Report.exists({ bookingId: booking._id })) {
      return res
        .status(409)
        .json({ message: "You've already reported this booking." });
    }

    const business = await Business.findById(booking.businessId).select("name");

    try {
      await Report.create({
        bookingId: booking._id,
        businessId: booking.businessId,
        customerId: booking.customerId || null,
        category,
        description,
      });
    } catch (createError) {
      // Two submissions racing past the check above
      if (createError.code === 11000) {
        return res
          .status(409)
          .json({ message: "You've already reported this booking." });
      }
      throw createError;
    }

    const businessName = business?.name || "the business";
    const label = categoryLabel(category);

    const jobs = [
      sendEmail({
        to: booking.customerEmail,
        replyTo: getSupportEmail() || undefined,
        subject: "We received your report",
        html: `
          <p>Hi ${escapeHtml(booking.customerName)},</p>
          <p>Thanks for letting us know about your appointment with <strong>${escapeHtml(businessName)}</strong>. Our team will review your report and get in touch if we need more information.</p>
          <p>Your report goes to BookBeautiq. The business is not sent a copy.</p>
        `,
      }),
    ];

    if (process.env.ADMIN_EMAIL) {
      jobs.push(
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: oneLine(`New report: ${label} — ${businessName}`),
          html: `
            <p><strong>${escapeHtml(label)}</strong></p>
            <p><strong>Business:</strong> ${escapeHtml(businessName)}</p>
            <p><strong>Reporter:</strong> ${escapeHtml(booking.customerName)} (${escapeHtml(booking.customerEmail)}, ${escapeHtml(booking.customerPhone)})</p>
            <p><strong>Booking:</strong> ${escapeHtml(booking.service)} on ${escapeHtml(booking.date)} at ${escapeHtml(booking.time)}</p>
            <p style="white-space:pre-wrap;">${escapeHtml(description)}</p>
            <p><a href="${process.env.CLIENT_URL}/admin">Open the admin dashboard</a></p>
          `,
        })
      );
    }

    const results = await Promise.allSettled(jobs);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Report email failed:", result.reason);
      }
    });

    res.status(201).json({ message: "Thanks. Your report has been sent to our team." });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ==========================================
// ADMIN — open-report count (for the sidebar)
// ==========================================

export const getReportSummary = async (req, res) => {
  try {
    const open = await Report.countDocuments({ status: "open" });
    res.status(200).json({ open });
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN — list reports
// ==========================================

export const listReports = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const status = STATUS_FILTERS.includes(req.query.status) ? req.query.status : null;

    const filter = status ? { status } : {};

    const [reports, total, countRows] = await Promise.all([
      Report.find(filter)
        // Open reports: oldest first, so nothing waits forever
        .sort({ createdAt: status === "open" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("bookingId", "customerName customerEmail service date time status")
        .populate("businessId", "name")
        .lean(),
      Report.countDocuments(filter),
      Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const counts = { open: 0, resolved: 0, dismissed: 0 };
    countRows.forEach((row) => {
      counts[row._id] = row.count;
    });

    // How many reports each business on this page has in total
    const businessIds = new Map();
    reports.forEach((r) => {
      if (r.businessId?._id) businessIds.set(String(r.businessId._id), r.businessId._id);
    });

    const statRows = businessIds.size
      ? await Report.aggregate([
          { $match: { businessId: { $in: [...businessIds.values()] } } },
          {
            $group: {
              _id: "$businessId",
              total: { $sum: 1 },
              open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
            },
          },
        ])
      : [];

    const statsByBusiness = new Map(
      statRows.map((row) => [String(row._id), { total: row.total, open: row.open }])
    );

    res.status(200).json({
      reports: reports.map((r) => ({
        ...r,
        categoryLabel: categoryLabel(r.category),
        businessStats:
          statsByBusiness.get(String(r.businessId?._id)) || { total: 0, open: 0 },
      })),
      counts,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("List reports error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN — one report in full
// ==========================================

export const getReportDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID." });
    }

    const report = await Report.findById(id)
      .populate(
        "bookingId",
        "customerName customerEmail customerPhone service staff date time status depositAmount createdAt"
      )
      .populate("businessId", "name location phone email status")
      .populate("resolvedBy", "firstName lastName")
      .lean();

    if (!report) return res.status(404).json({ message: "Report not found." });

    const history = report.businessId?._id
      ? await Report.find({ businessId: report.businessId._id, _id: { $ne: report._id } })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("category status createdAt")
          .lean()
      : [];

    res.status(200).json({
      report: { ...report, categoryLabel: categoryLabel(report.category) },
      history: history.map((h) => ({ ...h, categoryLabel: categoryLabel(h.category) })),
    });
  } catch (error) {
    console.error("Report detail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN — resolve or dismiss
// ==========================================

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "");
    const note = String(req.body?.note || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID." });
    }
    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Status must be resolved or dismissed." });
    }
    if (note.length < 5) {
      return res
        .status(400)
        .json({ message: "Please add a short note (at least 5 characters)." });
    }
    if (note.length > 500) {
      return res.status(400).json({ message: "Note must be 500 characters or fewer." });
    }

    // Only open reports can be closed, so nobody gets two emails
    const report = await Report.findOneAndUpdate(
      { _id: id, status: "open" },
      {
        $set: {
          status,
          adminNote: note,
          resolvedAt: new Date(),
          resolvedBy: req.user.userId,
        },
      },
      { new: true }
    )
      .populate("bookingId", "customerName customerEmail")
      .populate("businessId", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found, or already closed." });
    }

    let emailSent = false;
    const reporter = report.bookingId;

    if (reporter?.customerEmail) {
      const outcome =
        status === "resolved"
          ? "We've reviewed your report and taken appropriate action. Thank you for helping keep BookBeautiq trustworthy."
          : "We've reviewed your report and couldn't find a breach of our policies at this time. If you have more information, just reply to this email and we'll take another look.";

      try {
        await sendEmail({
          to: reporter.customerEmail,
          replyTo: getSupportEmail() || undefined,
          subject: "Update on your report",
          html: `
            <p>Hi ${escapeHtml(reporter.customerName)},</p>
            <p>${outcome}</p>
          `,
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Failed to send report outcome email:", emailError);
      }
    }

    res.status(200).json({
      message: emailSent
        ? `Report ${status}. The reporter has been notified.`
        : `Report ${status}, but the reporter couldn't be emailed.`,
      emailSent,
      report: {
        _id: report._id,
        status: report.status,
        adminNote: report.adminNote,
        resolvedAt: report.resolvedAt,
      },
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ message: error.message });
  }
};