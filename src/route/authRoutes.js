import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long!" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 characters long!" });
    }

    // Check if user already exists

    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingEmail || existingUsername) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username!" });
    }

    const avatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage: avatar,
    });

    await user.save();
    const token = generateToken(user?._id);

    res.json({
      token,
      user: {
        _id: user?._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in Register Route", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Generate token
    const token = generateToken(user?._id);

    res.json({
      token,
      user: {
        _id: user?._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in Login Route", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
});

export default router;
