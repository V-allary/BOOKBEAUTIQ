import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
const SEND_WINDOW_MS = 60 * 60 * 1000;

const getUserId = (req) =>
  req.user?.userId || req.user?.id || req.user?._id;

// A 6-digit code is only 1M possibilities, so a plain hash would be
// brute-forceable if the database ever leaked. Keying the hash with a
// server secret (and binding it to the user) prevents that.
const hashCode = (userId, code) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${userId}:${code}`)
    .digest("hex");

// ==========================================
// SEND CODE
// ==========================================

export const sendEmailVerificationCode = async (req, res) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isEmailVerified) {
      return res.status(200).json({
        alreadyVerified: true,
        message: "Your email is already verified.",
      });
    }

    const now = Date.now();

    // 60-second cooldown between codes
    if (user.emailVerificationLastSentAt) {
      const elapsed = now - user.emailVerificationLastSentAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          reason: "cooldown",
          message: "A code was just sent. Please wait before requesting another.",
          retryAfter: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
        });
      }
    }

    // Hourly cap, so nobody can use this to spam an inbox
    const windowActive =
      user.emailVerificationWindowStart &&
      now - user.emailVerificationWindowStart.getTime() < SEND_WINDOW_MS;

    const sendCount = windowActive ? user.emailVerificationSendCount : 0;

    if (sendCount >= MAX_SENDS_PER_HOUR) {
      const retryAfter = Math.ceil(
        (user.emailVerificationWindowStart.getTime() + SEND_WINDOW_MS - now) / 1000
      );
      return res.status(429).json({
        reason: "limit",
        message: "Too many codes requested. Please try again later.",
        retryAfter,
      });
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");

    user.emailVerificationCode = hashCode(user._id, code);
    user.emailVerificationExpires = new Date(now + CODE_TTL_MS);
    user.emailVerificationAttempts = 0;
    user.emailVerificationLastSentAt = new Date(now);
    user.emailVerificationSendCount = sendCount + 1;
    user.emailVerificationWindowStart = windowActive
      ? user.emailVerificationWindowStart
      : new Date(now);
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: `${code} is your BookBeautiq verification code`,
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Your BookBeautiq verification code is:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:16px 0;">${code}</p>
          <p>It expires in 10 minutes. Never share this code with anyone.</p>
          <p>If you didn't create a BookBeautiq account, you can ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification code:", emailError);

      // Don't punish the user for our failure — let them retry right away
      user.emailVerificationCode = null;
      user.emailVerificationExpires = null;
      user.emailVerificationLastSentAt = null;
      user.emailVerificationSendCount = Math.max(0, user.emailVerificationSendCount - 1);
      await user.save();

      return res.status(502).json({
        message: "We couldn't send the email right now. Please try again in a moment.",
      });
    }

    res.status(200).json({
      message: `We sent a 6-digit code to ${user.email}.`,
      retryAfter: RESEND_COOLDOWN_MS / 1000,
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// VERIFY CODE
// ==========================================

export const verifyEmailCode = async (req, res) => {
  try {
    const userId = getUserId(req);
    const code = String(req.body?.code || "").trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Enter the 6-digit code." });
    }

    const existing = await User.findById(userId).select("isEmailVerified");
    if (!existing) return res.status(404).json({ message: "User not found." });

    if (existing.isEmailVerified) {
      return res.status(200).json({
        message: "Your email is already verified.",
        isEmailVerified: true,
      });
    }

    // Claim one attempt atomically BEFORE comparing. Parallel guesses
    // each get their own count, so the 5-attempt limit can't be bypassed.
    const claimed = await User.findOneAndUpdate(
      {
        _id: userId,
        emailVerificationAttempts: { $lt: MAX_ATTEMPTS },
        emailVerificationCode: { $ne: null },
        emailVerificationExpires: { $gt: new Date() },
      },
      { $inc: { emailVerificationAttempts: 1 } },
      { new: true }
    );

    if (!claimed) {
      return res.status(400).json({
        expired: true,
        message: "This code has expired or was tried too many times. Please request a new one.",
      });
    }

    const expected = Buffer.from(claimed.emailVerificationCode, "hex");
    const provided = Buffer.from(hashCode(claimed._id, code), "hex");

    const matches =
      expected.length === provided.length &&
      crypto.timingSafeEqual(expected, provided);

    if (!matches) {
      const attemptsLeft = MAX_ATTEMPTS - claimed.emailVerificationAttempts;

      if (attemptsLeft <= 0) {
        await User.findByIdAndUpdate(claimed._id, {
          $set: { emailVerificationCode: null, emailVerificationExpires: null },
        });
        return res.status(400).json({
          expired: true,
          message: "Too many incorrect attempts. Please request a new code.",
        });
      }

      return res.status(400).json({
        attemptsLeft,
        message: `That code isn't right. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`,
      });
    }

    await User.findByIdAndUpdate(claimed._id, {
      $set: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
        emailVerificationAttempts: 0,
      },
    });

    res.status(200).json({
      message: "Email verified.",
      isEmailVerified: true,
    });
  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({ message: error.message });
  }
};