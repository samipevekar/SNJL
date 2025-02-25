import { Router } from "express";
import { getUser, loginUser, logoutUser , registerUser, verifyUser } from "../controllers/userController.js";
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

// get worker
userRoutes.get("/", isLoggedIn, getUser);

export default userRoutes;
