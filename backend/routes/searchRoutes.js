import { Router } from "express";
import { searchUsers } from "../controllers/searchController.js";
import { searchValidation } from "../middlewares/searchValidation.js";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js";

const searchRoutes = Router();

searchRoutes.get("/searchUser", isLoggedIn, searchUsers);
searchRoutes.delete("/searchdelete", isLoggedIn, searchUsers);

export default searchRoutes;
