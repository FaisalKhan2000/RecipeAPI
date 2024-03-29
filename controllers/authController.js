import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";
import Otp, { sendForgetPasswordOtp } from "../models/OtpModel.js";
import otpGenerator from "otp-generator";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { createJWT } from "../utils/tokenUtils.js";
import { sendEmailVerification } from "../models/OtpModel.js";
import cloudinary from "cloudinary";

// SIGNUP
export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  let imageLink = {};

  if (req.file) {
    // Assuming only one image is uploaded
    const file = req.file;
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "Recipe-Users",
    });

    imageLink = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  // Check if any required fields are missing
  if (!email || !name || !password) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "User already exists",
    });
  }

  // Determine user role
  const isFirstAccount = (await User.countDocuments()) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    role: role,
    image: imageLink,
  });

  // Send success response
  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "User registered successfully" });
};

//  SEND EMAIL VERIFICATION
export const sendOtpToVerifyEmail = async (req, res) => {
  const { email } = req.body;

  // Check if user exists with the provided email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "User not found. Create an account first.",
    });
  }

  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  let result = await Otp.findOne({ otp: otp });
  while (result) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
    });
    result = await Otp.findOne({ otp: otp });
  }

  // Create OTP record
  await Otp.create({ email, otpType: "verify-email", otp });

  // Send verification email
  await sendEmailVerification(email, otp);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "OTP sent successfully",
    otp, // For testing purposes, you may choose to remove this in production
  });
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!email || !otp) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "no email or otp found" });
  }

  // Find the most recent OTP for the email
  const response = await Otp.find({ email, otpType: "verify-email" })
    .sort({ createdAt: -1 })
    .limit(1);

  if (response.length === 0 || otp !== response[0].otp) {
    return res.status(400).json({
      success: false,
      message: "The OTP is not valid",
    });
  }

  user.verified = true;
  user.save();
  // Delete OTP record
  await Otp.deleteMany({ email });

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "email verified successfully" });
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  const isValidUser =
    user && user.verified && (await comparePassword(password, user.password));

  if (!isValidUser) {
    throw new UnauthenticatedError("invalid credentials");
  }

  const payload = { userId: user._id, role: user.role };
  const token = createJWT(payload);

  // one day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;

  // setting cookie
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay), // expires in 1day
    secure: process.env.NODE_ENV === "production",
  });

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: `Welcome back, ${user.name} !` });
};

// LOGOUT
export const logout = async (req, res, next) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

// FORGET PASSWORD
export const sendOtpToResetPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists with the provided email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "User not found. Create an account first.",
    });
  }

  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  let result = await Otp.findOne({ otp: otp });
  while (result) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
    });
    result = await Otp.findOne({ otp: otp });
  }

  // Create OTP record
  await Otp.create({ email, otpType: "reset-password", otp });

  // Send verification email
  await sendForgetPasswordOtp(email, otp);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "OTP sent successfully",
    otp, // For testing purposes, you may choose to remove this in production
  });
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!email || !otp || !newPassword) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "no email , otp or password " });
  }

  // Find the most recent OTP for the email
  const response = await Otp.find({ email, otpType: "reset-password" })
    .sort({ createdAt: -1 })
    .limit(1);

  if (response.length === 0 || otp !== response[0].otp) {
    return res.status(400).json({
      success: false,
      message: "The OTP is not valid",
    });
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user's password
  user.password = hashedPassword;
  await user.save();

  // Delete OTP record
  await Otp.deleteMany({ email });

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Password changed successfully" });
};
