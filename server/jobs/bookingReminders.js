import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC+3, no daylight saving

const STAGES = [
  { key: "0d", offset: 0, label: "Today", phrase: "today" },
  { key: "1d", offset: 1, label: "Tomorrow", phrase: "tomorrow" },
  { key: "3d", offset: 3, label: "In 3 days", phrase: "in 3 days" },
];

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toYMD = (date) => date.toISOString().slice(0, 10);
const nairobiToday = () => toYMD(new Date(Date.now() + NAIROBI_OFFSET_MS));

const addDays = (ymd, days) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toYMD(d);
};

// Understands "2026-10-20" (or an ISO string starting with it).
// Anything else returns null and is counted in the summary.
const normalizeDate = (value) => {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Bookings store dates like "Sat 17" (no month or year). Resolve to the first
// day on or after the booking was created with that weekday and day number.
const resolveBookingDate = (label, createdAt) => {
  const m = String(label || "").trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!m || !createdAt) return null;

  const weekday = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
  const dayOfMonth = Number(m[2]);
  const start = toYMD(new Date(new Date(createdAt).getTime() + NAIROBI_OFFSET_MS));

  for (let i = 0; i <= 366; i++) {
    const ymd = addDays(start, i);
    const d = new Date(`${ymd}T00:00:00Z`);
    if (d.getUTCDate() === dayOfMonth && WEEKDAYS[d.getUTCDay()] === weekday) {
      return ymd;
    }
  }
  return null;
};

// Understands "2:30 PM" and "14:30".
const timeToMinutes = (value) => {
  const m = String(value || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return 9999;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const p = m[3]?.toUpperCase();
  if (p === "PM" && h < 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + min;
};

const runBookingReminders = async ({ dryRun = false } = {}) => {
  const today = nairobiToday();
  const stageByDate = new Map(
    STAGES.map((s) => [addDays(today, s.offset), s])
  );

  const candidates = await Booking.find({
    status: "Confirmed",
    depositPaid: true,
  });

  const byBusiness = new Map();
  let unparsableDates = 0;

  for (const booking of candidates) {
    const ymd =
    normalizeDate(booking.date) ||
    resolveBookingDate(booking.date, booking.createdAt);
    if (!ymd) {
      unparsableDates++;
      continue;
    }

    const stage = stageByDate.get(ymd);
    if (!stage) continue;
    if ((booking.remindersSent || []).includes(stage.key)) continue;

    const id = String(booking.businessId);
    if (!byBusiness.has(id)) byBusiness.set(id, []);
    byBusiness.get(id).push({ booking, stage });
  }

  let businessesNotified = 0;
  let bookingsIncluded = 0;
  const preview = [];

  for (const [businessId, entries] of byBusiness) {
    const business = await Business.findById(businessId);
    if (!business) continue;

    const owner = await User.findById(business.owner);
    if (!owner) continue;

    const sections = STAGES.map((stage) => {
      const items = entries
        .filter((e) => e.stage.key === stage.key)
        .sort((a, b) => timeToMinutes(a.booking.time) - timeToMinutes(b.booking.time));
      if (!items.length) return "";

      const rows = items
        .map(({ booking: b }) => {
          const staff =
            b.staff && b.staff !== "Not specified"
              ? ` with ${escapeHtml(b.staff)}`
              : "";
          return `<li><strong>${escapeHtml(b.time)}</strong> — ${escapeHtml(b.customerName)}, ${escapeHtml(b.service)}${staff}<br/>Phone: ${escapeHtml(b.customerPhone)}</li>`;
        })
        .join("");

      return `<h3>${stage.label}</h3><ul>${rows}</ul>`;
    }).join("");

    const soonest = STAGES.find((s) => entries.some((e) => e.stage.key === s.key));
    const count = entries.length;
    const title = `Reminder: ${count} appointment${count === 1 ? "" : "s"} ${soonest.phrase}`;

    preview.push({ business: business.name, appointments: count });

    if (dryRun) continue;

    try {
      await notify({
        userId: owner._id,
        type: "booking_reminder",
        title,
        message: `You have ${count} upcoming appointment${count === 1 ? "" : "s"} at ${business.name}. Check your dashboard for details.`,
        email: owner.email,
        link: "/dashboard",
        emailHtml: `
          <p>Hi ${escapeHtml(owner.firstName)},</p>
          <p>Here are your upcoming appointments at ${escapeHtml(business.name)}:</p>
          ${sections}
          <p><a href="${process.env.CLIENT_URL}/dashboard">Open your dashboard</a></p>
        `,
      });
    } catch (error) {
      // Not marked as sent, so the next run retries this owner.
      console.error(`Booking reminder failed for ${business.name}:`, error);
      continue;
    }

    for (const stage of STAGES) {
      const ids = entries
        .filter((e) => e.stage.key === stage.key)
        .map((e) => e.booking._id);
      if (ids.length) {
        await Booking.updateMany(
          { _id: { $in: ids } },
          { $addToSet: { remindersSent: stage.key } }
        );
      }
    }

    businessesNotified++;
    bookingsIncluded += count;
  }

  const summary = {
    dryRun,
    today,
    businessesNotified,
    bookingsIncluded,
    unparsableDates,
    ...(dryRun ? { wouldNotify: preview } : {}),
  };

  console.log("Booking reminders:", JSON.stringify(summary));
  return summary;
};

export default runBookingReminders;