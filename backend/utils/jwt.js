import jwt from 'jsonwebtoken'

const generateToken = (userId,role) => {
  return jwt.sign({ id: userId,role:role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};



export {generateToken }