import express from "express";
const router = express.Router();

import {
  signUp,
  sendOtpToVerifyEmail,
  verifyEmail,
  login,
  logout,
  sendOtpToResetPassword,
  resetPassword,
} from "../controllers/authController.js";

import upload from "../middleware/multerMiddleware.js";

router.route("/signup").post(upload.single("image"), signUp);
router.route("/send-email-verification").post(sendOtpToVerifyEmail);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/forget-password").post(sendOtpToResetPassword);
router.route("/reset-password").post(resetPassword);

export default router;
