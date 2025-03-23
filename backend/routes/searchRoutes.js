import { Router } from "express";
import { searchUsers } from "../controllers/searchController.js";
import { searchValidation } from "../middlewares/searchValidation.js";

const SearchRoutes = Router();

SearchRoutes.get("/searchUser", searchValidation, searchUsers);

export default SearchRoutes;
