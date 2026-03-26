const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// ✅ Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email usn department category")
      .populate("scholarship", "title amount category");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// ✅ Get applications for a specific scholarship
router.get("/scholarship/:scholarshipId", async (req, res) => {
  try {
    const applications = await Application.find({ scholarship: req.params.scholarshipId })
      .populate("student", "name email usn department category income")
      .populate("scholarship", "title amount category eligibility");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// ✅ Get application count for a scholarship
router.get("/count/:scholarshipId", async (req, res) => {
  try {
    const count = await Application.countDocuments({ scholarship: req.params.scholarshipId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error counting applications" });
  }
});

// ✅ Get all application counts
router.get("/counts", async (req, res) => {
  try {
    const counts = await Application.aggregate([
      {
        $group: {
          _id: "$scholarship",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: "Error counting applications" });
  }
});

// ✅ Create a new application
router.post("/", async (req, res) => {
  try {
    const { studentId, scholarshipId } = req.body;
    
    console.log("Application request received:", { studentId, scholarshipId });
    
    if (!studentId || !scholarshipId) {
      return res.status(400).json({ message: "Student ID and Scholarship ID are required" });
    }

    // Check if application already exists
    const existing = await Application.findOne({ student: studentId, scholarship: scholarshipId });
    if (existing) {
      // Return success even if already exists - allows redirect but prevents duplicate count
      return res.status(200).json({ message: "Application already exists", application: existing });
    }

    const newApplication = new Application({
      student: studentId,
      scholarship: scholarshipId,
    });
    
    await newApplication.save();
    console.log("Application created successfully:", newApplication._id);
    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (err) {
    console.error("Application creation error:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid student ID or scholarship ID format" });
    }
    res.status(500).json({ message: "Error creating application", error: err.message });
  }
});

module.exports = router;

