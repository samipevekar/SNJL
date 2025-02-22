import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js";
import { loginRecruiter, logoutRecruiter, registerRecruiter, verifyEmail,  } from '../controllers/recruiterController.js'



const recruiterRouter = Router()

recruiterRouter.post('/register' , upload.single('profileImage'), registerRecruiter)
recruiterRouter.post('/verify' ,verifyEmail)
recruiterRouter.post('/login' ,loginRecruiter)
recruiterRouter.post('/logout' ,logoutRecruiter)


export default recruiterRouter

