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
    const existingWorker = await User.findOne({email:email});
    if (existingWorker) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          
    // Store the unverified worker in temporary storage
    unverifiedWorkers.set(email, {
      name,
      firstName: "", 
      lastName: "",  
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

   // Create the user in the database
const newWorker = new User({
  name: workerData.name,
  firstName: "", // Empty initially
  lastName: "",  // Empty initially
  email: workerData.email || null,
  phone: workerData.phone || undefined,
  password: hashedPassword,
  isPhoneVerified: true,
  verificationCode: null,
});


    await newWorker.save();

    // Remove the unverified worker from temporary storage
    unverifiedWorkers.delete(email);

    // Generate JWT token
    const token = generateToken(newWorker._id, newWorker.role);

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
    const worker = await User.findOne({email:email }).select("+password");

    if (!worker) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }

    if(worker.isGoogleUser){
      return res.status(400).json({
        success: false,
        message: "This email is registered with Google. Please login using Google.",
      });
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
  let user = req.user
  console.log('user : ',user)
  res.status(200).json({ success: true, message: "Logout successful" });
};

// get user
export const getUser = async(req,res)=>{
  try {
    let userId = req.user.id

    let user = await User.findById(userId)
    if(!user){
      res.status(400).json({message:"User not found"})
    }
  
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({message:"Internal server error"})
    console.log("Error in getUser controller",error.message)
  }
}

// google authentication
export const userLoginWithGoogle = async (req, res) => {
  const { email, googleId, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Agar user normal sign-up se bana tha, to Google ID update kar denge
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.googleId = googleId;
        await user.save(); // Update user with Google details
      }

      // Generate JWT token
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    }

    // Agar user nahi mila, to naya Google user create karein
    user = new User({
      name,
      email,
      googleId,
      isGoogleUser: true
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "New Google account created",
      token,
      user,
    });
  } catch (error) {
    console.error("Error in Google login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save the code and expiration time in the unverifiedUsers map
    unverifiedWorkers.set(email, {
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
    const userData = unverifiedWorkers.get(email);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found or verification code expired" });
    }

    // Check if the code matches
    if (userData.verificationCode !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Check if the code has expired
    if (userData.verificationCodeExpires < new Date()) {
      unverifiedWorkers.delete(email);
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Clear the user from the unverifiedUsers map
    unverifiedWorkers.delete(email);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//updating the profile after user sin up 
export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      firstName, lastName, username, address, pinCode, birthDate, gender, bio,
      highestQualification, college, graduationYear, currentCompany,
      jobTitle, workExperience, skills, portfolio, languageProficiency, achievements
    } = req.body;

    if (firstName && lastName) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.name = `${firstName} ${lastName}`; // Auto-update name field
    }

    Object.assign(user, {
      username,
      address,
      pinCode,
      birthDate,
      gender,
      bio,
      highestQualification,
      college,
      graduationYear,
      currentCompany,
      jobTitle,
      workExperience,
      skills,
      portfolio,
      languageProficiency,
      achievements,
    });

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
