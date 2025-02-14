import EmployerUser from "../models/hiringUser.js";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import validator from "validator";
import AppError from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/nodemailer.js";
dotenv.config();

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Temporary storage for unverified users (in-memory, replace with Redis in production)
const unverifiedUsers = new Map();

// Register a new hiring user (without saving to the database)
export const registerUser = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Check if user already exists
    const existingUser = await EmployerUser.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash the password

    let profileImage =
      req?.file ||
      "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/default.jpg";
    console.log(profileImage);
    // Store the unverified user in temporary storage
    unverifiedUsers.set(email, {
      name,
      email,
      phone,
      password,
      profileImage: profileImage,
      verificationCode,
      verificationCodeExpires,
    });

    // Send verification code via SMS
    await sendVerificationEmail(email, verificationCode);

    res
      .status(201)
      .json({ message: "Verification email sent. Please verify your email." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify phone number and create user
export const verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    // Validate input
    if (!email || !code) {
      return res.status(400).json({ message: "email and code are required" });
    }

    // Retrieve the unverified user from temporary storage
    const userData = unverifiedUsers.get(email);
    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found or verification code expired" });
    }

    // Check if the verification code matches
    if (userData.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if the verification code has expired
    if (userData.verificationCodeExpires < new Date()) {
      unverifiedUsers.delete(phone); // Clean up expired data
      return res.status(400).json({ message: "Verification code expired" });
    }

    let profileImageUrl =
      userData.profileImage ||
      "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/default.jpg";
    // Upload profile image to Cloudinary if provided

    if (("file", profileImageUrl)) {
      try {
        const result = await uploadOnCloudinary(profileImageUrl?.path);

        if (result) {
          profileImageUrl = result.secure_url;
        }
      } catch (error) {
        return next(
          new AppError(error || "file not upload ,please try again", 500)
        );
      }
    }

    // Create the user in the database
    const newUser = new EmployerUser({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      profileImage: profileImageUrl,
      isPhoneVerified: true,
    });

    await newUser.save();

    // Remove the unverified user from temporary storage
    unverifiedUsers.delete(email);

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Set token in cookie
    res.cookie("token", token, {
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      message: "user registered successfully",
      newUser,
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await EmployerUser.findOne({ email }).select("+password");
    console.log("user", user);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    console.log("isPasswordValid", isPasswordValid);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    user.password = undefined;
    // Set token in cookie
    res.cookie("token", token, {
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout user
export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logout successful" });
};
