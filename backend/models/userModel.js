import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim:true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true, // Allows either email or phone to be missing
    validate: [validator.isEmail, "Please provide a valid email"],
    trim:true
  },
  phone: {
    type: String,
    sparse: true,
    trim:true,
    validate: {
      validator: function (value) {
        return !value || validator.isMobilePhone(value, "any", { strictMode: false }); 
      },
      message: "Please provide a valid phone number",
    },
  },
  password: {
    type: String,
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, // Hide password from query results
  },
  profileImage: {
    type: String,
    default: "default.jpg",
  },
  role:{
    type:String,
    default:"User"
  },
  friends: [
    {
      friendId: { type: mongoose.Schema.Types.ObjectId, required: true },
      friendModel: { type: String, enum: ["User", "Recruiter"], required: true }
    }
  ],
  googleId: {
    type: String, // Store Google user ID
    unique: true,
    sparse: true, // Allow normal users to have null Google ID
  },
  isGoogleUser: {
    type: Boolean,
    default: false, // To differentiate Google users from normal users
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
