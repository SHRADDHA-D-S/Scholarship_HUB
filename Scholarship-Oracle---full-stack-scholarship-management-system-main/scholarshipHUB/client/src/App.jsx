import StudentSignup from "./components/StudentSignup";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import StudentLogin from "./components/StudentLogin";
import StudentDashboard from "./components/StudentDashboard";
import OfficeDashboard from "./components/OfficeDashboard";
import OfficeLogin from "./components/OfficeLogin";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Student routes */}
          <Route path="/student" element={<StudentLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />

          {/* 🚨 New Signup Route */}
          <Route path="/student/signup" element={<StudentSignup />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Office routes */}
          <Route path="/office/login" element={<OfficeLogin />} />
          <Route
            path="/office/dashboard"
            element={
              <ProtectedRoute>
                <OfficeDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
