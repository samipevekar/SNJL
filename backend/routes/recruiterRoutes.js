import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js";
import { forgotPassword, getRecruiter, loginRecruiter, logoutRecruiter, recruiterLoginWithGoogle, registerRecruiter, resetPassword, verifyEmail, verifyResetPasswordCode,  } from '../controllers/recruiterController.js'



const recruiterRouter = Router()

recruiterRouter.post('/register' , upload.single('profileImage'), registerRecruiter)
recruiterRouter.post('/verify' ,verifyEmail)
recruiterRouter.post('/login' ,loginRecruiter)
recruiterRouter.post('/logout' ,isLoggedIn,logoutRecruiter)
recruiterRouter.get('/' ,isLoggedIn,getRecruiter)
recruiterRouter.post('/google' , recruiterLoginWithGoogle)
recruiterRouter.post("/forgot-password", forgotPassword);
recruiterRouter.post("/verify-reset-code", verifyResetPasswordCode);
recruiterRouter.post("/reset-password", resetPassword);


export default recruiterRouter

