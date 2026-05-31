const crypto = require("crypto");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const createToken = (userId) => {
  return signToken({ id: userId }, {
    expiresIn: "7d",
  });
};

const buildUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    headline: user.headline,
    location: user.location,
    resumeText: user.resumeText,
    resumeFile: user.resumeFile,
    education: user.education,
    experience: user.experience,
    companyName: user.companyName,
    companyDescription: user.companyDescription,
  };
};

exports.registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      skills,
      headline,
      location,
      resumeText,
      resumeFile,
      education,
      experience,
      companyName,
      companyDescription,
    } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedName || !normalizedEmail || !normalizedPassword || !role) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      role,
      skills: Array.isArray(skills) ? skills : [],
      headline: headline || "",
      location: location || "",
      resumeText: resumeText || "",
      resumeFile: resumeFile || "",
      education: education || "",
      experience: experience || "",
      companyName: role === "employer" ? companyName || normalizedName : "",
      companyDescription: role === "employer" ? companyDescription || "" : "",
    });

    res.status(201).json({
      message: "Registration successful.",
      token: createToken(user._id),
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }

    return res.status(500).json({
      message: error.message || "Registration failed.",
    });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isLegacyPlainTextPassword = !/^\$2[aby]\$\d{2}\$/.test(String(user.password || ""));
    if (isLegacyPlainTextPassword) {
      user.password = password;
      await user.save();
    }

    res.json({
      message: "Login successful.",
      token: createToken(user._id),
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }

    return res.status(500).json({
      message: error.message || "Login failed.",
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email is registered, a password reset link has been generated." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpires);
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
    console.log(`Password reset link for ${user.email}: ${resetUrl}`);

    res.json({
      message: "Password reset link generated. Check server logs or use the token to reset your password.",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({
    user: buildUserResponse(req.user),
  });
};
