import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import crypto from "crypto";
import notify from "../utils/notify.js";
import User from "../models/User.js";



// Create booking — customer only
export const createBooking = async (req, res) => {
  try {
    const {
      businessId, service, staff, date, time,
      customerName, customerEmail, customerPhone,
      depositAmount,
    } = req.body;

    if (!businessId || !service || !date || !time || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: "Missing required booking details." });
    }

    const business = await Business.findById(businessId);
    if (!business || business.status !== "approved") {
      return res.status(404).json({ message: "Business not found." });
    }

    // ==========================================
    // PREVENT DOUBLE BOOKINGS
    // ==========================================

    const conflictFilter = {
      businessId,
      date,
      time,
      status: { $ne: "Cancelled" },
    };

    if (staff && staff !== "Not specified") {
      // Team business: same staff member can't be double-booked
      conflictFilter.staff = staff;
    }
    // Independent business (no staff): any existing booking at that
    // date+time for this business blocks a new one, since conflictFilter
    // already scopes to businessId/date/time with no staff condition.

    const conflict = await Booking.findOne(conflictFilter);

    if (conflict) {
      return res.status(409).json({
        message: staff && staff !== "Not specified"
          ? "This professional is already booked at that date and time. Please choose another slot."
          : "This professional is already booked at that date and time. Please choose another slot.",
      });
    }

    const booking = await Booking.create({
      customerId: req.user?.userId || null,
      businessId,
      service,
      staff: staff || "Not specified",
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      depositAmount: depositAmount || 0,
      status: "Pending",
    });

    const owner = await User.findById(business.owner);
    if (owner) {
      await notify({
        userId: owner._id,
        type: "new_booking",
        title: "New booking received",
        message: `${customerName} booked ${service} for ${date} at ${time}.`,
        email: owner.email,
        link: "/dashboard",
        emailHtml: `
          <p>Hi ${owner.firstName},</p>
          <p>You have a new booking for <strong>${business.name}</strong>:</p>
          <p>${customerName} — ${service} on ${date} at ${time}</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard">View in your dashboard</a></p>
        `,
      });
    }


    res.status(201).json({ message: "Booking created.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Logged-in customer's own bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.userId })
      .populate("businessId", "name location image")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Business owner viewing bookings for their business
export const getBusinessBookings = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only view your own business's bookings." });
    }

    const bookings = await Booking.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel — customer can cancel their own booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only cancel your own bookings." });
    }

    booking.status = "Cancelled";
    await booking.save();

    const business = await Business.findById(booking.businessId);
    if (business) {
      const owner = await User.findById(business.owner);
      if (owner) {
        await notify({
          userId: owner._id,
          type: "booking_cancellation",
          title: "A booking was cancelled",
          message: `${booking.customerName} cancelled their ${booking.service} appointment on ${booking.date} at ${booking.time}.`,
          email: owner.email,
          link: "/dashboard",
        });
      }
    }

    if (booking.customerId) {
      await notify({
        userId: booking.customerId,
        type: "booking_cancelled",
        title: "Booking cancelled",
        message: `Your booking for ${booking.service} on ${booking.date} has been cancelled.`,
        email: booking.customerEmail,
        link: "/dashboard",
      });
    } else {
      // Guest — email only, no in-app notification possible
      await notify({
        userId: null,
        type: "booking_cancelled",
        title: "Booking cancelled",
        message: `Your booking for ${booking.service} on ${booking.date} has been cancelled.`,
        email: booking.customerEmail,
      });
    }

    res.status(200).json({ message: "Booking cancelled.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Add near your other imports at the top:
// import Business from "../models/Business.js"; // already imported

export const getAvailability = async (req, res) => {
  try {
    const { businessId, date, duration, staff } = req.query;

    if (!businessId || !date) {
      return res.status(400).json({ message: "businessId and date are required." });
    }

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const serviceDuration = Number(duration) || 60;

    // Which day of week is this date? (matches "Mon","Tue" etc. used by closedDays)
    const dayAbbrev = new Date(date).toLocaleDateString("en-US", { weekday: "short" });

    if (business.closedDays?.includes(dayAbbrev)) {
      return res.status(200).json({ slots: [], closed: true });
    }

    // Build all candidate 30-min slot starts between opening and closing
    const [openHour, openMin] = business.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = business.closingTime.split(":").map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    const candidates = [];
    for (let t = openMinutes; t + serviceDuration <= closeMinutes; t += 30) {
      candidates.push(t);
    }

    // Existing non-cancelled bookings for this business (and staff, if given) on this date
    const dateBookings = await Booking.find({
      businessId,
      status: { $ne: "Cancelled" },
      ...(staff && staff !== "Not specified" ? { staff } : {}),
    });

    // Filter to bookings actually on this date — date is stored as "Wed 13" style,
    // so match against the same day/date formatting used at booking time.
    const targetDay = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    const targetDate = new Date(date).getDate().toString();
    const relevantBookings = dateBookings.filter(
      (b) => b.date === `${targetDay} ${targetDate}`
    );

    const toMinutes = (timeStr) => {
      // "9:00 AM" -> minutes since midnight
      const [time, period] = timeStr.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    const occupied = relevantBookings.map((b) => {
      const start = toMinutes(b.time);
      return { start, end: start + (b.duration || 60) };
    });

    const isOverlapping = (start, end) =>
      occupied.some((o) => start < o.end && end > o.start);

    const availableSlots = candidates
      .filter((start) => !isOverlapping(start, start + serviceDuration))
      .map((mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const period = h >= 12 ? "PM" : "AM";
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const displayMinute = m === 0 ? "00" : m;
        return `${displayHour}:${displayMinute} ${period}`;
      });

    res.status(200).json({ slots: availableSlots, closed: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Business marks a booking as completed — triggers the review email
export const markBookingCompleted = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const business = await Business.findById(booking.businessId);
    const isOwner = business?.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's bookings." });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ message: "This booking is already marked completed." });
    }

    const reviewToken = crypto.randomBytes(24).toString("hex");

    booking.status = "Completed";
    booking.reviewToken = reviewToken;
    await booking.save();

    const reviewUrl = `${process.env.CLIENT_URL}/review/${reviewToken}`;

    await Business.findByIdAndUpdate(business._id, {
      $inc: { completedBookingsCount: 1 },
      lastBookingAt: new Date(),
    });


    await notify({
      userId: booking.customerId,
      type: "review_reminder",
      title: "How was your visit?",
      message: `Tell us about your ${booking.service} experience at ${business.name}.`,
      email: booking.customerEmail,
      link: `/review/${reviewToken}`,
      emailHtml: `
        <p>Hi ${booking.customerName},</p>
        <p>Thanks for booking with ${business.name} on BookBeautiq. We'd love to hear how it went.</p>
        <p><a href="${reviewUrl}">Leave a review</a></p>
        <p>This link is unique to your booking and can only be used once.</p>
      `,
    });

    res.status(200).json({ message: "Booking marked completed. Review email sent.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
