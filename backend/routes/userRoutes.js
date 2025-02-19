import { Router } from "express";
import { loginUser, logoutUser , registerUser, verifyUser } from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js";

const userRoutes = Router();

// Register a new worker
userRoutes.post("/register",registerUser );

// Verify phone/email
userRoutes.post("/verify", verifyUser);

// Login worker
userRoutes.post("/login", loginUser);

// Logout worker
userRoutes.post("/logout", isLoggedIn, logoutUser);

export default userRoutes;
