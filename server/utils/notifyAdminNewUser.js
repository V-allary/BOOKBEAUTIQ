import sendEmail from "./sendEmail.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function notifyAdminNewUser(user) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SUPPORT_EMAIL;
  if (!to) return;

  const isBusiness = user.role === "business";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  await sendEmail({
    to,
    subject: isBusiness ? "New business owner registered" : "New customer registered",
    html: `
      <h2>${isBusiness ? "New business owner" : "New customer"}</h2>
      <p><b>Name:</b> ${esc(fullName)}</p>
      <p><b>Email:</b> ${esc(user.email)}</p>
      <p><b>Phone:</b> ${esc(user.phone)}</p>
      <p><b>Role:</b> ${esc(user.role)}</p>
      <p><b>Time:</b> ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>
      ${isBusiness ? "<p>They still need to verify. Check Owner Verifications in the admin dashboard.</p>" : ""}
    `,
  });
}