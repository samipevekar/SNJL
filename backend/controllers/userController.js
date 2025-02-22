import User from "../models/userModel.js";
import dotenv from "dotenv";
import validator from "validator";
import AppError from '../middlewares/errorMiddleware.js'
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/nodemailer.js";
dotenv.config();

// Temporary storage for unverified users
const unverifiedWorkers = new Map();

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new worker (without saving to the database)
export const registerUser = async (req, res, next) => {
  const { name, email,phone,password,  } = req.body;
console.log(req.body)
  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ success :false , message: "Name and password are required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ success :false , message: "Either email or phone number is required" });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({success: false, message: "Invalid email" });
    }

    if (phone && !validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({success: false, message: "Invalid phone number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success :false , message: "Password must be at least 8 characters long" });
    }

    // Check if worker already exists
    const existingWorker = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingWorker) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the unverified worker in temporary storage
    unverifiedWorkers.set(email, {
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
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Verify email/phone and create worker
export const verifyUser = async (req, res, next) => {
  const { email, code } = req.body; // identifier can be email or phone

  try {
    // Validate input
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    // Retrieve the unverified worker from temporary storage
    const workerData = unverifiedWorkers.get(email);
    if (!workerData) {
      return res.status(404).json({ message: "User not found or verification code expired" });
    }

    // Check if the verification code matches
    if (workerData.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if the verification code has expired
    if (workerData.verificationCodeExpires < new Date()) {
      unverifiedWorkers.delete(email); // Clean up expired data
      return res.status(400).json({ message: "Verification code expired" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(workerData.password, salt);

    // Create the worker in the database
    const newWorker = new User({
      name: workerData.name,
      email: workerData.email || null,
      phone: workerData.phone || undefined,

      role: "User",
      password: hashedPassword,

      password: workerData.password,
      // profileImage: profileImageUrl,
      isPhoneVerified: true,
      verificationCode: null,

    });

    await newWorker.save();

    // Remove the unverified worker from temporary storage
    unverifiedWorkers.delete(email);

    // Generate JWT token
    const token = generateToken(newUser._id, newWorker.role);

    res.status(201).json({ success: true, message: "User registered successfully", token, user: newWorker });
  } catch (error) {
    console.error("Error verifying worker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login worker
export const loginUser = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Validate input
    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "Email/phone and password are required" });
    }

    // Find worker by email or phone
    const worker = await User.findOne({ $or: [{ email }, { phone }] }).select("+password");

    if (!worker) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, worker.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }

    // Generate JWT token
 const token = generateToken(worker._id, worker.role);
     worker.password = undefined;

    res.status(200).json({ success: true, message: "Login successful", token, worker });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout worker
export const logoutUser  = (req, res) => {
  res.status(200).json({ success: true, message: "Logout successful" });
};