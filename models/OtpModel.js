import mongoose from "mongoose";
import { mailSender } from "../utils/mailSender.js";

const OtpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otpType: {
    type: String,
    enum: ["verify-email", "reset-password"],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

// Function to send email verification OTP
export async function sendEmailVerification(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Email Verification",
      `<h1>Please confirm your email address</h1>
       <p>Here is your verification OTP: ${otp}</p>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

// Function to send forget password OTP
export async function sendForgetPasswordOtp(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Reset Password",
      `<h1>Reset Your Password</h1>
       <p>Use the following OTP to reset your password: ${otp}</p>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

export default mongoose.model("Otp", OtpSchema);
