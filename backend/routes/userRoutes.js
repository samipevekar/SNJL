import { Router } from "express";
import { forgotPassword, getUser, loginUser, logoutUser , registerUser, resetPassword, userLoginWithGoogle, verifyResetPasswordCode, verifyUser } from "../controllers/userController.js";
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

// google authentication
userRoutes.post('/google', userLoginWithGoogle)

userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/verify-reset-code", verifyResetPasswordCode);
userRoutes.post("/reset-password", resetPassword);

export default userRoutes;
