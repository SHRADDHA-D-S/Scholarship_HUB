// server/models/Student.js
const mongoose = require("mongoose");

console.log("[MODEL] Loading Student model"); // <-- proves this file is loaded

const studentSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: [true, "USN is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9]{10}$/.test(v);
      },
      message: "USN must be exactly 10 alphanumeric characters"
    }
  },
  income: {
    type: Number,
    required: [true, "Income is required"],
    min: [20001, "Income must be greater than 20,000"],
    max: [9999999, "Income must be less than 10,000,000"]
  },
  department: { type: String, trim: true },
  category: { type: String, trim: true },
  password: { type: String },
  name: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Invalid email format"
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
