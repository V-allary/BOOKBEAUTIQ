import Notification from "../models/Notification.js";
import sendEmail from "./sendEmail.js";

const EMAIL_SUBJECTS = {
  booking_confirmed: "Your booking is confirmed",
  appointment_reminder: "Reminder: Your appointment is coming up",
  payment_confirmation: "Payment received",
  booking_cancelled: "Your booking was cancelled",
  booking_rescheduled: "Your booking was rescheduled",
  new_message: "You have a new message",
  review_reminder: "How was your appointment?",
  new_booking: "You have a new booking",
  booking_cancellation: "A booking was cancelled",
  new_review: "You received a new review",
  payment_received: "You received a payment",
  business_approved: "Your business has been approved",
  business_rejected: "Your business listing was not approved",
  subscription_reminder: "Subscription payment reminder",
};
 
const notify = async ({ userId, type, title, message, email, link = "", emailHtml }) => {
  if (userId) {
    try {
      await Notification.create({ userId, type, title, message, link });
    } catch (error) {
      console.error("Failed to create in-app notification:", error);
    }
  }

  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: EMAIL_SUBJECTS[type] || title,
        html: emailHtml || `<p>${message}</p>`,
      });
    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  }
};

export default notify;
