import jwt from "jsonwebtoken";
import AppError from "../utils/errorUtil.js";

const isUserLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;
  if (!user_token) {
    return next(new AppError("Unauthenticated please login", 400));
  }
  console.log(user_token)

  const userDetails = await jwt.verify(user_token, process.env.JWT_SECRET);
  console.log(userDetails);
  req.user = userDetails;
  console.log("userdetails", req.user);
  next();
};

export { isUserLoggedIn };
