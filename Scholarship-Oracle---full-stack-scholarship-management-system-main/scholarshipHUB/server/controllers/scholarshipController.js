import Scholarship from "../models/Scholarship.js";
import Application from "../models/Application.js";

export const addScholarship = async (req, res) => {
  try {
    const { title, description, amount, deadline } = req.body;
    const newScholarship = new Scholarship({ title, description, amount, deadline });
    await newScholarship.save();
    res.status(201).json({ msg: "Scholarship added successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find();
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const applyScholarship = async (req, res) => {
  try {
    const { studentId, scholarshipId } = req.body;

    const newApplication = new Application({
      student: studentId,
      scholarship: scholarshipId,
    });

    await newApplication.save();
    res.status(201).json({ msg: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
