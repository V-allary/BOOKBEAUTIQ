import User from "../models/User.js";

// Returns the current logged-in user's live data — used whenever the
// frontend needs to confirm a status (verification, email, etc.) that
// may have changed since the browser's cached copy was last refreshed.
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};