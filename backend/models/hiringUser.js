
import mongoose from "mongoose";
import validator from 'validator'
import bcrypt from 'bcryptjs'

const EmployerUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isMobilePhone(value, "any", { strictMode: false });
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
    default: "default.jpg", // Default profile image
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  role:{
    type:String,
    default:"HiringUser"
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
});

// Hash password before saving
EmployerUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
EmployerUserSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("candidatePassword",candidatePassword)
  return await bcrypt.compare(candidatePassword, this.password);
};

const EmployerUser = mongoose.model("EmployerUser", EmployerUserSchema);
export default EmployerUser
