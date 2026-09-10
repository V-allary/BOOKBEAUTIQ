import Booking from "../models/Bookings.js";
import notify from "./notify.js";

// Sends a reminder for any Confirmed booking happening "tomorrow"
// (based on how your date strings are stored, e.g. "Wed 13")
const checkReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const day = tomorrow.toLocaleDateString("en-US", { weekday: "short" });
  const date = tomorrow.getDate().toString();
  const tomorrowLabel = `${day} ${date}`;

  const bookings = await Booking.find({
    status: "Confirmed",
    date: tomorrowLabel,
  });

  for (const booking of bookings) {
    await notify({
      userId: booking.customerId,
      type: "appointment_reminder",
      title: "Appointment reminder",
      message: `Reminder: your ${booking.service} appointment is tomorrow at ${booking.time}.`,
      email: booking.customerEmail,
      link: "/dashboard",
      emailHtml: `
        <p>Hi ${booking.customerName},</p>
        <p>This is a reminder that you have an appointment tomorrow:</p>
        <p><strong>${booking.service}</strong> with ${booking.staff} at ${booking.time}</p>
      `,
    });
  }

  console.log(`Reminder check: ${bookings.length} appointment reminder(s) sent.`);
};

export default checkReminders;
