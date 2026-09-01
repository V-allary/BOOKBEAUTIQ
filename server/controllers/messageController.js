 import Message from "../models/Message.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";

// Confirm the requester (customer side) has actually booked this business
const customerCanMessage = async (businessId, userId, email) => {
  const filter = { businessId };
  if (userId) filter.customerId = userId;
  else if (email) filter.customerEmail = email;
  else return false;

  const booking = await Booking.findOne(filter);
  return !!booking;
};

// ==========================================
// SEND MESSAGE — customer side
// ==========================================
export const sendCustomerMessage = async (req, res) => {
  try {
    const { businessId, text, customerEmail } = req.body;
    const userId = req.user?.userId || null;

    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty." });
    if (!customerEmail) return res.status(400).json({ message: "Your email is required to message this business." });

    const allowed = await customerCanMessage(businessId, userId, customerEmail);

    if (!allowed) {
      return res.status(403).json({ message: "You can only message a business you've booked with." });
    }

    const message = await Message.create({
      businessId,
      customerId: userId,
      customerEmail,
      sender: "customer",
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SEND MESSAGE — business side
// ==========================================

export const sendBusinessMessage = async (req, res) => {
  try {
    const { businessId, customerEmail, text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty." });

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only message on behalf of your own business." });
    }

    const message = await Message.create({
      businessId,
      customerEmail,
      sender: "business",
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET CONVERSATION — customer side
// ==========================================
export const getCustomerConversation = async (req, res) => {
  try {
    const { businessId } = req.params;
    const email = req.query.email;

    if (!email) return res.status(400).json({ message: "Email is required." });

    // Mark business messages as read now that the customer is viewing them
    await Message.updateMany(
      { businessId, customerEmail: email, sender: "business", read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({ businessId, customerEmail: email }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET CONVERSATION — business side
// ==========================================
export const getBusinessConversation = async (req, res) => {
  try {
    const { businessId, customerEmail } = req.params;

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own business's conversations." });
    }

    await Message.updateMany(
      { businessId, customerEmail, sender: "customer", read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({ businessId, customerEmail }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// LIST ALL CONVERSATIONS — business side
// (one entry per unique customer)
// ==========================================

export const listBusinessConversations = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own business's conversations." });
    }

    const conversations = await Message.aggregate([
      { $match: { businessId: business._id } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customerEmail",
          lastMessage: { $first: "$text" },
          lastSender: { $first: "$sender" },
          lastAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$sender", "customer"] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
