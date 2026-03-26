const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: Number,
  deadline: String,
  link: { type: String }, // Application link provided by admin
  provider: String,
  category: String,
  department: String,
  eligibility: String, // Eligibility notes
});

const Scholarship = mongoose.model("Scholarship", scholarshipSchema);
module.exports = Scholarship;
