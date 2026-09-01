import Service from "../models/Service.js";
import Business from "../models/Business.js";

// Get all services
export const getServices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.businessId) filter.businessId = req.query.businessId;
    const services = await Service.find(filter);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create service
export const createService = async (req, res) => {
  try {
    const business = await Business.findById(req.body.businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    const isOwner = business.owner?.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only add services to your own business." });
    }

    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });

    const business = await Business.findById(service.businessId);
    const isOwner = business?.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's services." });
    }

    await service.deleteOne();
    res.status(200).json({ message: "Service deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
