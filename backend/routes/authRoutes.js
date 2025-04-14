const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, location, bio } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    const icons = ["user_icon2.jpeg", "user_icon4.jpeg"];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const user = new User({
      name,
      email,
      password,
      role: "user",
      phone: phone || "",
      location: location || "",
      bio: bio || "",
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString("hex"),
      profilePicture: randomIcon,
    });

    await user.save();

    const verificationLink = `http://localhost:8000/api/auth/verify-email?token=${user.verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Confirm your email address",
      html: `<p>Please confirm your email by clicking <a href="${verificationLink}">here</a>.</p>`,
    });

    res.status(201).json({ message: "Registration successful. Please verify your email." });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Неправильне посилання");
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send("Недійсний токен");
    }

    user.emailVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.redirect("http://localhost:5173/login"); 
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).send("Внутрішня помилка сервера");
  }
});

router.patch("/update-profile", authMiddleware, async (req, res) => {
  const { phone, location, bio, profilePicture } = req.body;
  const userId = req.user.id;

  if (!phone && !location && !bio && !profilePicture) {
    return res.status(400).json({ message: "At least one field must be updated." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});


router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});


module.exports = router;
