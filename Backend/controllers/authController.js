import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/mailer.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log("Registration attempt:", { name, email, role });

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User exists" });
    }

    console.log("Creating new user...");
    const user = await User.create({ name, email, password, role });
    if (!user) {
      console.log("Failed to create user");
      return res.status(400).json({ message: "Invalid user data" });
    }
    
    console.log("User created successfully:", user._id);

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = expires;
    await user.save();

    // Send verification code via email
    console.log("Sending verification email to:", user.email);
    try {
      await sendEmail(
        user.email,
        "Verify Your Email - RentDirect",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to RentDirect!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your verification code is ready</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${user.name},</p>
            <p style="color: #6b7280; margin-bottom: 25px;">Thank you for registering with RentDirect. To complete your registration, please use the verification code below:</p>
            
            <div style="background: #f3f4f6; border: 2px dashed #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Your verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #0d9488; letter-spacing: 5px; font-family: 'Courier New', monospace;">${verificationCode}</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">This code will expire in 10 minutes for security reasons.</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">If you didn't create an account with RentDirect, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 RentDirect. All rights reserved.</p>
          </div>
        </div>`
      );
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, just log it
    }

    console.log("Registration successful, sending response");
    res.status(201).json({
      message: "Registration successful. Please check your email for the verification code.",
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
    console.error("Error stack:", error.stack);
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

    // Check if user is suspended
    if (user.status === "suspended") {
      return res.status(403).json({ 
        message: "Your account has been suspended. Please contact support for assistance.",
        code: "ACCOUNT_SUSPENDED"
      });
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

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Mark user as confirmed and clear verification code
    user.isConfirmed = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Generate and return login token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Email verified successfully!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isConfirmed: user.isConfirmed,
      },
    });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isConfirmed) {
      return res.status(200).json({ message: "Email already verified. You can log in." });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = expires;
    await user.save();

    // Send new verification code via email
    await sendEmail(
      user.email,
      "New Verification Code - RentDirect",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Verification Code</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your new code is ready</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${user.name},</p>
          <p style="color: #6b7280; margin-bottom: 25px;">You requested a new verification code. Please use the code below to verify your email:</p>
          
          <div style="background: #f3f4f6; border: 2px dashed #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Your new verification code:</p>
            <div style="font-size: 32px; font-weight: bold; color: #0d9488; letter-spacing: 5px; font-family: 'Courier New', monospace;">${verificationCode}</div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">This code will expire in 10 minutes for security reasons.</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 RentDirect. All rights reserved.</p>
        </div>
      </div>`
    );

    res.status(200).json({ message: "New verification code sent to your email." });
  } catch (err) {
    console.error("Resend verification code error:", err);
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
