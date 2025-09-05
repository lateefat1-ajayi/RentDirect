import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.substring(0, 20) + "...");
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded);
      
      req.user = await User.findById(decoded.id).select("-password");
      console.log("User found:", req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : null);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  console.log("No authorization header or invalid format");
  return res.status(401).json({ message: "Not authorized, no token" });
};


export const adminOnly = (req, res, next) => {
  console.log("Admin middleware check:", {
    user: req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : null,
    hasUser: !!req.user,
    userRole: req.user?.role
  });
  
  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted for:", req.user.email);
    next();
  } else {
    console.log("Admin access denied for:", req.user?.email, "Role:", req.user?.role);
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

export const landlordOnly = (req, res, next) => {
  console.log("Landlord middleware check:", {
    user: req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : null,
    hasUser: !!req.user,
    userRole: req.user?.role
  });
  
  if (req.user && req.user.role === "landlord") {
    console.log("Landlord access granted for:", req.user.email);
    next();
  } else {
    console.log("Landlord access denied for:", req.user?.email, "Role:", req.user?.role);
    res.status(403).json({ message: "Access denied. Landlords only." });
  }
};

export const tenantOnly = (req, res, next) => {
  console.log("Tenant middleware check:", {
    user: req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : null,
    hasUser: !!req.user,
    userRole: req.user?.role
  });
  
  if (req.user && req.user.role === "tenant") {
    console.log("Tenant access granted for:", req.user.email);
    next();
  } else {
    console.log("Tenant access denied for:", req.user?.email, "Role:", req.user?.role);
    res.status(403).json({ message: "Access denied. Tenants only." });
  }
};
