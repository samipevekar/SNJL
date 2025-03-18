import { Router } from "express";
import { getRandomUsers } from "../controllers/getRandomUser.js";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js";

const randomDataRoutes = Router();

randomDataRoutes.get("/getRandomUser", isLoggedIn, getRandomUsers);

export default randomDataRoutes;
