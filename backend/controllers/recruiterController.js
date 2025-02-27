import Recruiter from "../models/recruiterModel.js";
import dotenv from "dotenv";
import validator from "validator";
import AppError from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/nodemailer.js";

dotenv.config();

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const unverifiedUsers = new Map();

export const registerRecruiter = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ success: false, message: "Name and password are required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: "Either email or phone number is required" });
    }

    // Ensure email is provided before validation
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Ensure phone is provided before validation
    if (phone && !validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingUser = await Recruiter.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    unverifiedUsers.set(email, {
      name,
      email,
      phone,
      password,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ success: true, message: "Verification email sent. Please verify your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const userData = unverifiedUsers.get(email);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found or verification code expired" });
    }

    if (userData.verificationCode !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (userData.verificationCodeExpires < new Date()) {
      unverifiedUsers.delete(email);
      return res.status(400).json({ success: false, message: "Verification code expired" });
    }

    const newUser = new Recruiter({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || undefined,
      password: userData.password,      
      isPhoneVerified: true,
      verificationCode: null,
    });

    await newUser.save();
    unverifiedUsers.delete(email);

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({ success: true, message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    console.log(error.message)
  }
};
export const loginRecruiter = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await Recruiter.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if(user.isGoogleUser){
      return res.status(400).json({
        success: false,
        message: "This email is registered with Google. Please login using Google.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);
    user.password = undefined;

    res.status(200).json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const logoutRecruiter = (req, res) => {
  res.status(200).json({ success: true, message: "Logout successful" });
};

// get user
export const getRecruiter = async(req,res)=>{
  try {
    let userId = req.user.id

    let recruiter = await Recruiter.findById(userId)
    if(!recruiter){
      res.status(400).json({message:"User not found"})
    }
  
    res.status(200).json(recruiter)
  } catch (error) {
    res.status(500).json({message:"Internal server error"})
    console.log("Error in getUser controller",error.message)
  }
}

// google authentication
export const recruiterLoginWithGoogle = async(req,res)=>{
  const { email, googleId, name } = req.body;

  try {
    let user = await Recruiter.findOne({ email });

    if (user) {
      if (!user.isGoogleUser) {
        return res.status(400).json({
          success: false,
          message: "This email is already registered. You can login with another email",
        });
      }

      // User is already a Google user, so generate JWT token
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    }

    // If no user exists, create a new Google user
    user = new Recruiter({
      name,
      email,
      googleId,
      isGoogleUser: true
    });

    await user.save();

    // Generate JWT token for new user
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "New Google account created",
      token,
      user,
    });
  } catch (error) {
    console.error("Error in Google login:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}