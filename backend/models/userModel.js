import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, 
  firstName: { type: String, default: "", trim: true }, 
  lastName: { type: String, default: "", trim: true },  
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true ,sparse: true, 
    validate: [validator.isEmail, "Please provide a valid email"],},
  phone: { type: String, required: true, sparse: true,
    trim:true,
    validate: {
      validator: function (value) {
        return !value || validator.isMobilePhone(value, "any", { strictMode: false }); 
      },
      message: "Please provide a valid phone number",
    }, },
  password: { type: String, required: true, minlength: [8, "Password must be at least 8 characters long"], select: false },
  address: { type: String, required: true },
  pinCode: { type: String, required: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
 
  highestQualification: { type: String, required: true },
  college: { type: String },
  graduationYear: { type: Number },
  currentCompany: { type: String },
  jobTitle: { type: String },
  workExperience: { type: Number },
  skills: [{ type: String }],
  portfolio: { type: String },
  resume: { type: String }, 
  languageProficiency: [{ type: String }],
  achievements: [{ type: String }],
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
 profileViewCount: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileViewCountModel'
  }],
  profileViewCountModel: {
    type: String,
    enum: ['User', 'Recruiter'],
    default: 'User'
  },
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
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  bio: {
  type: String,
  maxlength: [100, "Bio must be less than 100 characters"],
  minlength: [10, "Bio must be at least 10 characters"],
  trim: true
}
});

userSchema.pre("save", function (next) {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
