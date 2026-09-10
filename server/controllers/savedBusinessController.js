import User from "../models/User.js";

export const toggleSaveBusiness = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { businessId } = req.params;
    const alreadySaved = user.savedBusinesses.some((id) => id.toString() === businessId);

    if (alreadySaved) {
      user.savedBusinesses = user.savedBusinesses.filter((id) => id.toString() !== businessId);
    } else {
      user.savedBusinesses.push(businessId);
    }

    await user.save();

    res.status(200).json({ saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySavedBusinesses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("savedBusinesses");
    res.status(200).json(user.savedBusinesses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
