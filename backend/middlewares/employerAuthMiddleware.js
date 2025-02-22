import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Update this path based on your project structure

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("token ")) {
      return res.status(401).json({ success: false, message: "Unauthorized, please login" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

<<<<<<< HEAD
    // Attach user details to `req.user`
=======
    // Attach user details to req.user
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};


export { isLoggedIn };