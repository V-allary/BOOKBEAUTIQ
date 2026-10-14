import User from "../models/User.js";
import notify from "../utils/notify.js";

const IDENTITY_TYPES = ["passport", "national_id", "drivers_license"];
const SOCIAL_HOSTS = { instagram: ["instagram.com"], tiktok: ["tiktok.com"] };
const HANDLE_RE = /^@?[A-Za-z0-9._]{1,30}$/;

// "" = left empty, null = invalid, otherwise a clean https URL.
// Only instagram.com / tiktok.com links are accepted, so admins never
// open an arbitrary link from a submission.
const cleanSocialUrl = (value, platform) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (raw.length > 200) return null;
  if (/^(www\.)?(instagram|tiktok)\.com$/i.test(raw)) return null;

  if (HANDLE_RE.test(raw)) {
    const handle = raw.replace(/^@/, "");
    return platform === "instagram"
      ? `https://www.instagram.com/${handle}`
      : `https://www.tiktok.com/@${handle}`;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const ok = SOCIAL_HOSTS[platform].some(
      (h) => host === h || host.endsWith(`.${h}`)
    );
    if (!ok || url.pathname.length < 2) return null;
    return `https://${url.hostname}${url.pathname}`;
  } catch {
    return null;
  }
};

const str = (v) => (typeof v === "string" ? v.trim() : "");

// Business owner submits identity + business (or freelance) verification
export const submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "Your account is already verified." });
    }
    if (user.verificationStatus === "under_review") {
      return res.status(400).json({ message: "Your verification is already under review." });
    }

    const { identityDocumentType, identityDocument } = req.body;

    // Older versions of the page don't send a type — treat them as licensed.
    const verificationType =
      req.body.verificationType === "freelance" ? "freelance" : "licensed";

    if (!IDENTITY_TYPES.includes(identityDocumentType) || !str(identityDocument)) {
      return res.status(400).json({
        message: "Please choose an identity document type and upload it.",
      });
    }

    if (verificationType === "licensed") {
      const legalBusinessName = str(req.body.legalBusinessName);
      const businessRegistrationNumber = str(req.body.businessRegistrationNumber);
      const businessAddress = str(req.body.businessAddress);
      const countryOfRegistration = str(req.body.countryOfRegistration);

      if (
        !legalBusinessName ||
        !businessRegistrationNumber ||
        !businessAddress ||
        !countryOfRegistration
      ) {
        return res.status(400).json({
          message: "Please fill in all the business details.",
        });
      }

      user.legalBusinessName = legalBusinessName;
      user.businessRegistrationNumber = businessRegistrationNumber;
      user.businessAddress = businessAddress;
      user.countryOfRegistration = countryOfRegistration;
      user.businessDocument = str(req.body.businessDocument); // optional
      user.verificationInstagramUrl = "";
      user.verificationTiktokUrl = "";
    } else {
      const instagram = cleanSocialUrl(req.body.instagramUrl, "instagram");
      const tiktok = cleanSocialUrl(req.body.tiktokUrl, "tiktok");

      if (instagram === null) {
        return res.status(400).json({
          message: "That doesn't look like an Instagram link. Use your profile link or @username.",
        });
      }
      if (tiktok === null) {
        return res.status(400).json({
          message: "That doesn't look like a TikTok link. Use your profile link or @username.",
        });
      }
      if (!instagram && !tiktok) {
        return res.status(400).json({
          message: "Please share at least one: your Instagram or your TikTok.",
        });
      }

      user.verificationInstagramUrl = instagram;
      user.verificationTiktokUrl = tiktok;
      user.legalBusinessName = "";
      user.businessRegistrationNumber = "";
      user.businessAddress = "";
      user.countryOfRegistration = "";
      user.businessDocument = "";
    }

    user.verificationType = verificationType;
    user.identityDocumentType = identityDocumentType;
    user.identityDocument = str(identityDocument);

    user.verificationStatus = "under_review";
    user.verificationSubmittedAt = new Date();
    user.verificationReviewedAt = null;
    user.verificationNotes = "";

    await user.save();

    res.status(200).json({
      message: "Verification submitted. Your account is now under review.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin — list everyone waiting for review
export const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: "under_review" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin — approve
export const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.verificationStatus !== "under_review") {
      return res.status(400).json({ message: "This account is not currently under review." });
    }

    user.verificationStatus = "verified";
    user.verificationReviewedAt = new Date();
    user.verificationNotes = "";

    await user.save();

    await notify({
      userId: user._id,
      type: "business_approved",
      title: "You're verified!",
      message: "Your account has been verified. You can now finish setting up your business.",
      email: user.email,
      link: "/onboarding",
      emailHtml: `
        <p>Hi ${user.firstName},</p>
        <p>Great news — your account has been verified.</p>
        <p>You can now continue setting up your business on BookBeautiq.</p>
        <p><a href="${process.env.CLIENT_URL}/onboarding">Continue Setting Up Your Business</a></p>
      `,
    });

    res.status(200).json({ message: "Account verified successfully.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin — reject
export const rejectVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.verificationStatus !== "under_review") {
      return res.status(400).json({ message: "This account is not currently under review." });
    }

    user.verificationStatus = "rejected";
    user.verificationReviewedAt = new Date();
    user.verificationNotes = req.body?.notes || "Verification was not approved.";

    await user.save();

    res.status(200).json({ message: "Verification rejected.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};