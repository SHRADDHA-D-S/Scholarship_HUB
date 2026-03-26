const express = require("express");
const router = express.Router();
const Scholarship = require("../models/scholarship");

// ✅ Get all scholarships
router.get("/", async (req, res) => {
  try {
    const scholarships = await Scholarship.find();
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ message: "Error fetching scholarships" });
  }
});

// ✅ Add a new scholarship
router.post("/", async (req, res) => {
  try {
    const newScholarship = new Scholarship(req.body);
    await newScholarship.save();
    res.status(201).json({ message: "Scholarship added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to add scholarship", error: err });
  }
});

// ✅ Delete a scholarship
router.delete("/:id", async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ message: "Scholarship deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting scholarship" });
  }
});

module.exports = router;
