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
  const { name, email,  password ,} = req.body;
  

  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ success: false, message: "Name and password are required" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: " email  is required" });
    }

    // Ensure email is provided before validation
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    
    // Ensure phone is provided before validation
   

    
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }
    
    // Check if user already exists
    const existingUser = await Recruiter.findOne({
      $or: [{ email }],
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    unverifiedUsers.set(email, {
      name,
      email,
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
  // console.log(email,code)

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
      password: userData.password,
      role: "Recruiter",
      isPhoneVerified: true,
    });

    await newUser.save();
    unverifiedUsers.delete(email);

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({ success: true, message: "User registered successfully", token, user: newUser });
  } catch (error) {
    console.error("Error verifying phone:", error);
    res.status(500).json({ success :false ,message: "Internal server error" });
  }
};
export const loginRecruiter = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await Recruiter.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if the user exists
    const user = await Recruiter.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save the code and expiration time in the unverifiedUsers map
    unverifiedUsers.set(email, {
      email,
      verificationCode,
      verificationCodeExpires,
    });

    // Send the verification code via email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const verifyResetPasswordCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Validate input
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    // Check if the user exists in the unverifiedUsers map
    const userData = unverifiedUsers.get(email);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found or verification code expired" });
    }

    // Check if the code matches
    if (userData.verificationCode !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Check if the code has expired
    if (userData.verificationCodeExpires < new Date()) {
      unverifiedUsers.delete(email);
      return res.status(400).json({ success: false, message: "Verification code expired" });
    }

    // If the code is valid, allow the user to reset their password
    res.status(200).json({ success: true, message: "Verification code verified. You can now reset your password." });
  } catch (error) {
    console.error("Error in verifyResetPasswordCode:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const resetPassword = async (req, res) => {
  const { email, newPassword, reEnterPassword } = req.body;

  try {
    // Validate input
    if (!email || !newPassword || !reEnterPassword) {
      return res.status(400).json({ success: false, message: "Email, new password, and re-entered password are required" });
    }

    // Check if the new passwords match
    if (newPassword !== reEnterPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check if the user exists
    const user = await Recruiter.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Clear the user from the unverifiedUsers map
    unverifiedUsers.delete(email);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};