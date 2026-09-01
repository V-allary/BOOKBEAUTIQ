import jwt from "jsonwebtoken";

// Decodes the token if one is present, but never blocks the request.
// Lets logged-in customers get their bookings linked to their account,
// while guests (no token) pass through untouched.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Invalid/expired token — just proceed as a guest instead of failing.
    }
  }

  next();
};

export default optionalAuth;
