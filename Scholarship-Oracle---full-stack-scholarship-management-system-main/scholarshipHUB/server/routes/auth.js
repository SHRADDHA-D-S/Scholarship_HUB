const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

// =========================
//  LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { usn, password } = req.body;

    if (!usn || !password) {
      return res
        .status(400)
        .json({ success: false, message: "USN and password required." });
    }

    const student = await Student.findOne({ usn });

    if (!student) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid USN or password." });
    }

    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid USN or password." });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: student._id,
        name: student.name,
        usn: student.usn,
        category: student.category,
        income: student.income,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
//  REGISTER (SIGNUP)
// =========================
router.post("/register", async (req, res) => {
  try {
    const { name, usn, email, category, income, password } = req.body;

    // Required checks
    if (!name || !usn || !email || !category || !income || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // USN validation: 10 alphanumeric
    const usnRegex = /^[A-Za-z0-9]{10}$/;
    if (!usnRegex.test(usn)) {
      return res.status(400).json({
        success: false,
        message:
          "USN must be exactly 10 characters and contain only letters and numbers.",
      });
    }

    // Income validation
    const incomeNum = Number(income);
    if (!Number.isFinite(incomeNum)) {
      return res
        .status(400)
        .json({ success: false, message: "Income must be a number." });
    }

    if (!(incomeNum > 20000 && incomeNum < 5000000)) {
      return res.status(400).json({
        success: false,
        message: "Income must be greater than 20,000 and less than 5,000,000.",
      });
    }

    // Duplicate check
    const exists = await Student.findOne({ $or: [{ usn }, { email }] });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "USN or Email already exists.",
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new student
    const student = new Student({
      name,
      usn,
      email,
      category,
      income: incomeNum,
      password: hashedPassword,
    });

    await student.save();

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      studentId: student._id,
    });
  } catch (err) {
    console.error("Error during register:", err);

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during signup.",
    });
  }
});

module.exports = router;
