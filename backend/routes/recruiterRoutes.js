import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js";
import { getRecruiter, loginRecruiter, logoutRecruiter, recruiterLoginWithGoogle, registerRecruiter, verifyEmail,  } from '../controllers/recruiterController.js'



const recruiterRouter = Router()

recruiterRouter.post('/register' , upload.single('profileImage'), registerRecruiter)
recruiterRouter.post('/verify' ,verifyEmail)
recruiterRouter.post('/login' ,loginRecruiter)
recruiterRouter.post('/logout' ,isLoggedIn,logoutRecruiter)
recruiterRouter.get('/' ,isLoggedIn,getRecruiter)
recruiterRouter.post('/google' , recruiterLoginWithGoogle)


export default recruiterRouter

