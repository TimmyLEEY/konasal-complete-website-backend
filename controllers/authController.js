import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Mailer setup (Gmail only with App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail App Password
  },
});

// Debug logs
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

// Helper to choose sender email
const getFromEmail = () => `"Konasal Support" <${process.env.EMAIL_USER}>`;

// ======================== REGISTER ========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // ✅ Send Confirmation Email
    const mailOptions = {
      from: getFromEmail(),
      to: newUser.email,
      subject: "🎉 Welcome to Konasal – Your account is ready!",
      html: `
          <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px; text-align:center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" 
               style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#004aad; padding:20px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:24px;">Konasal Insurance</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; text-align:left; color:#333;">
              <h2 style="color:#004aad;">Welcome, ${newUser.name} 🎉</h2>
              <p style="font-size:16px; line-height:1.6;">
                Thank you for joining <strong>Konasal</strong>. 
                Your account has been successfully created and you’re now part of our community 🚀.
              </p>
              <p style="font-size:16px; line-height:1.6;">
                Click the button below to log in and start exploring:
              </p>
              <p style="text-align:center; margin:30px 0;">
                <a href="${process.env.CLIENT_URL}/login" 
                   style="background:#004aad; color:#ffffff; padding:14px 28px; text-decoration:none; font-weight:bold; border-radius:6px; display:inline-block;">
                   Login to Your Account
                </a>
              </p>
              <p style="font-size:14px; color:#666;">
                If you did not sign up for this account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f6f8; padding:20px; text-align:center; font-size:12px; color:#777;">
              &copy; ${new Date().getFullYear()} Konasal Insurance. All rights reserved. <br/>
              Need help? <a href="mailto:info@konasallp.com" style="color:#004aad; text-decoration:none;">Contact Support</a>
            </td>
          </tr>
        </table>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "User registered successfully & confirmation email sent" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================== LOGIN ========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================== FORGOT PASSWORD ========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: getFromEmail(),
      to: user.email,
      subject: "🔐 Reset Your Konasal Password",
      html: `
         <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px; text-align:center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" 
               style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#004aad; padding:20px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:24px;">Konasal Insurance</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; text-align:left; color:#333;">
              <h2 style="color:#004aad;">Password Reset Request</h2>
              <p style="font-size:16px; line-height:1.6;">
                Hello ${user.name}, we received a request to reset your password.
              </p>
              <p style="font-size:16px; line-height:1.6;">
                If this was you, click the button below to securely reset your password:
              </p>
              <p style="text-align:center; margin:30px 0;">
                <a href="${resetLink}" target="_blank"
                   style="background:#e63946; color:#ffffff; padding:14px 28px; text-decoration:none; font-weight:bold; border-radius:6px; display:inline-block;">
                   Reset Password
                </a>
              </p>
              <p style="font-size:14px; color:#666;">
                This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f6f8; padding:20px; text-align:center; font-size:12px; color:#777;">
              &copy; ${new Date().getFullYear()} Konasal Insurance. All rights reserved. <br/>
              Need help? <a href="mailto:support@konasal.com" style="color:#004aad; text-decoration:none;">Contact Support</a>
            </td>
          </tr>
        </table>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================== RESET PASSWORD ========================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: err.message });
  }
};
