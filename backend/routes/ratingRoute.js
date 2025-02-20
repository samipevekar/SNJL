// routes/ratingRoute.js
import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js";
import { isUserLoggedIn } from "../middlewares/userAuthMiddleware.js";
import {
  createRating,
  getReceivedRatings,
  getGivenRatings,
  getAverageRating
} from "../controllers/ratingController.js";

const router = Router();


const checkAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    isLoggedIn(req, res, () => {
      if (req.user) {
        next();
      } else {
        isUserLoggedIn(req, res, next);
      }
    });
  }
};

router.post('/create', checkAuth, createRating);
router.get('/received', checkAuth, getReceivedRatings);
router.get('/received/:userId', getReceivedRatings);
router.get('/given', checkAuth, getGivenRatings);
router.get('/average/:userId', getAverageRating);


export default router;
