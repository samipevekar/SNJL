import { Router } from "express";

import { loginWorker, logoutWorker, registerWorker, verifyWorker } from "../controllers/workerController.js";
import { isUserLoggedIn } from "../middlewares/userAuthMiddleware.js";

const router = Router();

// Register a new worker
router.post("/register", registerWorker);

// Verify phone/email
router.post("/verify", verifyWorker);

// Login worker
router.post("/login", loginWorker);

// Logout worker
router.post("/logout", isUserLoggedIn, logoutWorker);

export default router;
