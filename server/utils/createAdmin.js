import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@bookbeautiq.com";
    const password = "ChangeMe123!";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      firstName: "BookBeautiq",
      lastName: "Admin",
      email,
      phone: "",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isPhoneVerified: true,
      accountStatus: "approved",
    });

    console.log("✅ Admin account created.");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();