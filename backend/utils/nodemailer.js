import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email service
  auth: {
    user: "snjlintern@gmail.com", // Your email address
    pass:"ninv nqni nhcy wmrc"
  },
});

/**
 * Send a verification email
 * @param {string} email - The recipient's email address
 * @param {string} verificationCode - The verification code to send
 */
export const sendVerificationEmail = async (email, verificationCode) => {
    // console.log(email,verificationCode)
  const mailOptions = {
    from: 'noreply@yourapp.com', // Sender email address
    to: email, // Recipient email address
    subject: "Email Verification", // Email subject
    text: `Your verification code is: ${verificationCode}`, // Plain text body
    html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`, // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export default transporter;