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

export const registerRecruiter = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingUser = await Recruiter.findOne({email:email});
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
      phone: userData.phone,
      password: userData.password,
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