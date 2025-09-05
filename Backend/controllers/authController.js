import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/mailer.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({ name, email, password, role });
    if (!user) return res.status(400).json({ message: "Invalid user data" });

    // Generate and store a dedicated email confirmation token
    const confirmToken = crypto.randomBytes(32).toString("hex");
    user.confirmationToken = confirmToken;
    await user.save();

    // Point to the correct frontend route: /confirm-email/:token
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email/${confirmToken}`;

    await sendEmail(
      user.email,
      "Confirm Your Email",
      `<p>Hi ${user.name},</p>
       <p>Click the link below to confirm your email:</p>
       <a href="${confirmUrl}">Confirm Email</a>`
    );

    // Do NOT issue a login token before email confirmation
    res.status(201).json({
      message: "Registration successful. Please check your email to confirm your account.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isConfirmed: user.isConfirmed,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isConfirmed) {
      return res.status(403).json({ message: "Please confirm your email first" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ confirmationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isConfirmed = true;
    user.confirmationToken = undefined; 
    await user.save();

    res.status(200).json({ message: "Email confirmed! You can now log in." });
  } catch (err) {
    console.error("Confirm email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendConfirmation = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isConfirmed) {
      return res.status(200).json({ message: "Email already confirmed. You can log in." });
    }

    const confirmToken = crypto.randomBytes(32).toString("hex");
    user.confirmationToken = confirmToken;
    await user.save();

    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email/${confirmToken}`;

    await sendEmail(
      user.email,
      "Confirm Your Email",
      `<p>Hi ${user.name},</p>
       <p>Click the link below to confirm your email:</p>
       <a href="${confirmUrl}">Confirm Email</a>`
    );

    res.status(200).json({ message: "Confirmation email resent. Please check your inbox." });
  } catch (err) {
    console.error("Resend confirmation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `<p>Hello ${user.name},</p>
       <p>You requested to reset your password. This link expires in 30 minutes.</p>
       <a href="${resetUrl}">Reset Password</a>`
    );

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
