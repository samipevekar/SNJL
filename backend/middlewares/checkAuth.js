import { isLoggedIn } from "./employerAuthMiddleware.js";
import { isUserLoggedIn } from "./userAuthMiddleware.js";

export const checkAuth = (req, res, next) => {
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