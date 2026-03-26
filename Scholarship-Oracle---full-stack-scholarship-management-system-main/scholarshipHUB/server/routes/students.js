// server/routes/student.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");

console.log("[ROUTES] student routes loaded"); // <-- proves this file is loaded

// helper
const isValidUsn = (val) => /^[A-Za-z0-9]{10}$/.test(String(val).trim());
const isValidIncomeNumber = (val) => {
  const num = Number(val);
  if (!Number.isFinite(num)) return false;
  return num > 20000 && num < 10000000;
};

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// PUT update — load document, set fields, save() (ensures schema validation)
router.put("/:id", async (req, res) => {
  console.log("[PUT] /students/:id called", { params: req.params, body: req.body });
  try {
    const { id } = req.params;
    const { usn, department, category, income } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: ["Invalid student id"] });
    }

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const errors = [];

    // USN
    if (usn !== undefined && usn !== null && String(usn).trim() !== "") {
      if (!isValidUsn(usn)) {
        errors.push("USN must be exactly 10 alphanumeric characters (no spaces).");
      } else {
        student.usn = String(usn).trim();
      }
    }

    // Income
    if (income !== undefined && income !== null && String(income).trim() !== "") {
      if (!isValidIncomeNumber(income)) {
        errors.push("Income must be a valid number > 20,000 and < 10,000,000.");
      } else {
        student.income = Number(income);
      }
    } else if (income !== undefined && String(income).trim() === "") {
      student.income = null;
    }

    // other fields
    if (department !== undefined) student.department = department === "" ? null : department;
    if (category !== undefined) student.category = category === "" ? null : category;

    if (errors.length > 0) {
      console.log("[PUT] validation errors:", errors);
      return res.status(400).json({ errors });
    }

    // this will run schema validators defined in Student model
    await student.save();

    const result = student.toObject();
    delete result.password;
    console.log("[PUT] update successful", result._id);
    res.json(result);
  } catch (err) {
    console.error("Error updating student (save):", err);
    if (err.name === "ValidationError") {
      const mongooseErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: mongooseErrors });
    }
    res.status(500).json({ message: "Error updating student profile" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student id" });
    }
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Error deleting student" });
  }
});

module.exports = router;
