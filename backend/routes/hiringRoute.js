import { Router } from "express";
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js";
import { loginUser, logoutUser, registerUser, verifyEmail,  } from "../controllers/hiringController.js";


const router = Router()

router.post('/register' , upload.single('profileImage'), registerUser)
router.post('/register/verify-email' ,verifyEmail)
router.post('/login' ,loginUser)
router.post('/logout' ,isLoggedIn,logoutUser)


export default router

