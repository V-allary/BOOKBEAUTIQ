import Staff from "../models/Staff.js";
import Business from "../models/Business.js";

const checkOwnership = async (businessId, req) => {
  const business = await Business.findById(businessId);
  if (!business) return { ok: false, status: 404, message: "Business not found." };

  const isOwner = business.owner?.toString() === req.user.userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return { ok: false, status: 403, message: "You can only manage your own business's staff." };
  }

  return { ok: true };
};

// Get all staff (optionally filtered by business)
export const getStaff = async (req, res) => {
  try {
    const filter = {};
    if (req.query.businessId) filter.businessId = req.query.businessId;

    const staff = await Staff.find(filter).populate("businessId", "name");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create staff member
export const createStaff = async (req, res) => {
  try {
    const check = await checkOwnership(req.body.businessId, req);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const existing = await Staff.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Staff member not found." });

    const check = await checkOwnership(existing.businessId, req);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
  try {
    const existing = await Staff.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Staff member not found." });

    const check = await checkOwnership(existing.businessId, req);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    await existing.deleteOne();
    res.status(200).json({ message: "Staff member deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
