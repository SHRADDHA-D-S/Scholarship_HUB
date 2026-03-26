import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        usn,
        password,
      });

      if (res.data && res.data.success) {
        localStorage.setItem("authRole", "student");
        if (res.data.token) localStorage.setItem("token", res.data.token);

        navigate("/student/dashboard");
      } else {
        setError("Invalid USN or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid USN or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">Student Portal</h2>

        {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

        <input className="w-full border rounded px-3 py-2 mb-4" value={usn} onChange={e => setUsn(e.target.value)} placeholder="USN" />

        <input type="password" className="w-full border rounded px-3 py-2 mb-6" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />

        <button className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-lg">Student Login</button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={() => navigate("/student/signup")} className="text-sky-600 hover:underline">
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
