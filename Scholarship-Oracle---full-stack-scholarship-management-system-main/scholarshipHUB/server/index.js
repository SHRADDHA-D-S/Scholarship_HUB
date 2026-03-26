const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const scholarshipRoutes = require("./routes/scholarships");
const studentRoutes = require("./routes/students");
const applicationRoutes = require("./routes/applications");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/applications", applicationRoutes);

// MongoDB connection
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not set in .env file!");
  console.error("📝 Please create a .env file in the server directory with:");
  console.error("   MONGO_URI=mongodb://localhost:27017/scholarshipHub");
  console.error("   JWT_SECRET=your_secret_key_here");
  console.error("   PORT=4000");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    if (err.message.includes("Invalid scheme")) {
      console.error("💡 Tip: MONGO_URI should start with 'mongodb://' or 'mongodb+srv://'");
      console.error("   Example: mongodb://localhost:27017/scholarshipHub");
    }
    process.exit(1);
  });

  const officeRoutes = require("./routes/office");
app.use("/office", officeRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
