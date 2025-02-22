import jwt from 'jsonwebtoken';

<<<<<<< HEAD
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRY || "7d",  // Default to 7 days
    }
  );
=======
const generateToken = (userId,role) => {
  return jwt.sign({ id: userId,role:role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97
};

export { generateToken };
