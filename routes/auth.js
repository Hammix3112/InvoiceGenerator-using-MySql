require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET;

// Google Login
router.post("/googlelogin", async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) return res.status(400).json({ error: "Token is required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({ name, email, password: "" });
    }

    const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
    res.json({ token: authToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// Create user
router.post(
  '/createuser',
  [
    body('username', 'Username must be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      // Check if user with this email already exists
      let user = await User.findOne({ where: { email: req.body.email } });
      if (user) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Create new user in DB
      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Generate JWT token
      const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);

      res.json({ token: authToken });
    } catch (error) {
      console.error("Error in createuser route:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Login
router.post(
  "/signin",
  [
    body("email").isEmail(),
    body("password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
      res.json({ token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Get User
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error in getuser route:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});
// Forgot Password
router.post("/passwordforgot", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const resetToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: "1h" });

    const resetLink = `https://invoicely.tecnosphere.org/reset-password/${resetToken}`;


    await sendResetEmail(email, resetLink);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Password Reset (Validate token and reset password)
router.post("/reset/:token", async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 5)
    return res.status(400).json({ error: "Password must be at least 5 characters long" });

  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const userId = decoded.user?.id;
    if (!userId) return res.status(400).json({ error: "Invalid token structure" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(400).json({ error: "User does not exist" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in password reset:", error.message);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

// Forgot Password
// router.post("/passwordforgot", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     const resetToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: "1h" });

//     const resetLink = `http://localhost:5000/reset?token=${resetToken}&email=${email}`;
//     // const resetLink = `http://localhost:5000/reset/${resetToken}`;



//     await sendResetEmail(email, resetLink);
//     res.json({ message: "Password reset link sent to your email" });
//   } catch (error) {
//     console.error("Error sending reset email:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Password Reset
// router
//   .route("/reset/:token")
//   .get(async (req, res) => {
//     try {
//       const decoded = jwt.verify(req.params.token, JWT_SECRET);
//       const user = await User.findByPk(decoded.user.id);
      

//       if (!user) return res.status(400).json({ error: "User does not exist" });
//       res.status(200).json({ message: "Token is valid" });
//     } catch (error) {
//       console.error(error.message);
//       res.status(400).json({ error: "Invalid or expired token" });
//     }
//   })
//   .post(async (req, res) => {
//     const { password } = req.body;
//     if (!password || password.length < 5)
//       return res.status(400).json({ error: "Password must be at least 5 characters long" });
  
//     try {
//       const decoded = jwt.verify(req.params.token, JWT_SECRET);
//       const userId = decoded.user?.id; // ✅ use decoded.user.id
//       if (!userId) return res.status(400).json({ error: "Invalid token structure" });
  
//       const user = await User.findByPk(userId);
//       if (!user) return res.status(400).json({ error: "User does not exist" });
  
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//       await user.save();
  
//       res.json({ message: "Password reset successfully" });
//     } catch (error) {
//       console.error("Error in password reset:", error.message);
//       res.status(400).json({ error: "Invalid or expired token" });
//     }
//   });
  

// Send Reset Email
async function sendResetEmail(email, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "hh0449901@gmail.com",
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
  });
}

module.exports = router;
