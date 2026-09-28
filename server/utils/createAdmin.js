import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

// The old default admin. Its password was committed to git, so this
// account should be removed once the new admin is confirmed working.
const LEGACY_ADMIN_EMAIL = "admin@bookbeautiq.com";

const args = process.argv.slice(2);
const resetPassword = args.includes("--reset-password");
const removeLegacy = args.includes("--remove-legacy");

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

const run = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    fail("Set a valid ADMIN_EMAIL in server/.env first.");
  }

  await connectDB();

  // ------------------------------------------
  // --remove-legacy
  // Refuses to run unless the new admin already
  // exists, so you can never delete the only admin.
  // ------------------------------------------
  if (removeLegacy) {
    if (email === LEGACY_ADMIN_EMAIL) {
      fail("ADMIN_EMAIL is still the legacy address. Nothing to remove.");
    }

    const currentAdmin = await User.findOne({ email, role: "admin" });
    if (!currentAdmin) {
      fail(`No admin exists for ${email} yet. Create it first.`);
    }

    const result = await User.deleteOne({
      email: LEGACY_ADMIN_EMAIL,
      role: "admin",
    });

    console.log(
      result.deletedCount
        ? "✅ Legacy admin account removed."
        : "ℹ️ No legacy admin account found."
    );
    process.exit(0);
  }

  // ------------------------------------------
  // Create or reset the admin
  // ------------------------------------------
  if (!password || password.length < 12) {
    fail("Set ADMIN_PASSWORD (at least 12 characters) in server/.env first.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== "admin") {
      fail(
        `${email} already belongs to a non-admin account. Use a different ADMIN_EMAIL.`
      );
    }

    if (!resetPassword) {
      console.log(
        "⚠️ Admin already exists. Run with --reset-password to change its password."
      );
      process.exit(0);
    }

    existing.password = hashedPassword;
    await existing.save();
    console.log(`✅ Password updated for ${email}.`);
    process.exit(0);
  }

  await User.create({
    firstName: process.env.ADMIN_FIRST_NAME || "BookBeautiq",
    lastName: process.env.ADMIN_LAST_NAME || "Admin",
    email,
    phone: "",
    password: hashedPassword,
    role: "admin",
    isEmailVerified: true,
    isPhoneVerified: true,
    accountStatus: "approved",
  });

  console.log(`✅ Admin account created for ${email}.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Admin script failed:", error);
  process.exit(1);
});