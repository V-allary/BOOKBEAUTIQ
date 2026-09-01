import User from "../models/User.js";

// Business owner submits identity + business verification together
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

    const {
      identityDocumentType,
      identityDocument,
      legalBusinessName,
      businessRegistrationNumber,
      businessAddress,
      countryOfRegistration,
      businessDocument,
    } = req.body;

    if (
      !identityDocumentType ||
      !identityDocument ||
      !legalBusinessName ||
      !businessRegistrationNumber ||
      !businessAddress ||
      !countryOfRegistration ||
      !businessDocument
    ) {
      return res.status(400).json({
        message: "All identity and business verification fields are required.",
      });
    }

    user.identityDocumentType = identityDocumentType;
    user.identityDocument = identityDocument;
    user.legalBusinessName = legalBusinessName.trim();
    user.businessRegistrationNumber = businessRegistrationNumber.trim();
    user.businessAddress = businessAddress.trim();
    user.countryOfRegistration = countryOfRegistration.trim();
    user.businessDocument = businessDocument;

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
