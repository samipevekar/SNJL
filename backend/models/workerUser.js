import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const WorkerUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true, // Allows either email or phone to be missing
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function (value) {
        return !value || validator.isMobilePhone(value, "any", { strictMode: false }); 
      },
      message: "Please provide a valid phone number",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, // Hide password from query results
  },
  profileImage: {
    type: String,
    default: "default.jpg",
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  role:{
    type:String,
    default:"User"
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
});

// Hash password before saving
WorkerUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
WorkerUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const WorkerUser = mongoose.model("WorkerUser", WorkerUserSchema);
export default WorkerUser;
