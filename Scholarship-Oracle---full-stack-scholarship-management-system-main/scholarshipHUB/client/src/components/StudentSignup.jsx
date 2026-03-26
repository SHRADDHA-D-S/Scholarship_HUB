import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentSignup() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [income, setIncome] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // REQUIRED fields
    if (
      !name ||
      !usn ||
      !email ||
      !category ||
      !income ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    // USN: exactly 10 chars, only letters + numbers
    const usnRegex = /^[A-Za-z0-9]{10}$/;
    if (!usnRegex.test(usn)) {
      setError(
        "USN must be exactly 10 characters and contain only letters and numbers (no spaces)."
      );
      return;
    }

    // Income: number > 20000 and < 5000000
    const incomeNum = Number(income);
    if (!Number.isFinite(incomeNum)) {
      setError("Income must be a valid number.");
      return;
    }
    if (!(incomeNum > 20000 && incomeNum < 5000000)) {
      setError(
        "Income must be greater than ₹20,000 and less than ₹50,00,000."
      );
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        name,
        usn,
        email,
        category,
        income: incomeNum,
        password,
      });

      if (res.data && res.data.success) {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/student"), 1000);
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);

      // Try to build a useful message from the backend response
      let backendMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null);

      if (!backendMessage && typeof err.response?.data === "string") {
        backendMessage = err.response.data; // e.g. "Cannot POST /auth/register"
      }

      if (!backendMessage && err.response?.status) {
        backendMessage = `Server error (status ${err.response.status}).`;
      }

      setError(backendMessage || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">
          Student Sign Up
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 text-sm">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4 text-sm">{success}</p>
        )}

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>

        {/* USN */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            USN
          </label>
          <input
            type="text"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            placeholder="Ex: 1AB21CS001"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-sky-300"
          >
            <option value="">Select category</option>
            <option value="GM">GM</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Income */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Income
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            placeholder="Enter annual income"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="text-sky-600 hover:underline"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
