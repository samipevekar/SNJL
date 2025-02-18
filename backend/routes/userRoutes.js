import { Router } from "express";

import { loginUser, logoutUser , registerUser, verifyUser } from "../controllers/userController.js";
import { isUserLoggedIn } from "../middlewares/userAuthMiddleware.js";

const router = Router();

// Register a new worker
router.post("/register",registerUser );

// Verify phone/email
router.post("/verify", verifyUser);

// Login worker
router.post("/login", loginUser);

// Logout worker
router.post("/logout", isUserLoggedIn, logoutUser);

export default router;
