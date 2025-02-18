import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js";
import { loginRecruiter, logoutRecruiter, registerRecruiter, verifyEmail,  } from '../controllers/recruiterController.js'



const router = Router()

router.post('/register' , upload.single('profileImage'), registerRecruiter)
router.post('/verify' ,verifyEmail)
router.post('/login' ,loginRecruiter)
router.post('/logout' ,isLoggedIn,logoutRecruiter)


export default router

