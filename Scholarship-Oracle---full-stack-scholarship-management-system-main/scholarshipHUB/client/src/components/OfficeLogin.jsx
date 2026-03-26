import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OfficeLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const OFFICE_USER = "office123";
  const OFFICE_PASS = "officepass";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (username === OFFICE_USER && password === OFFICE_PASS) {
      localStorage.setItem("authRole", "office");
      navigate("/office/dashboard");
    } else {
      setError("Invalid office username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Office Login
        </h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 mb-3 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-emerald-600 text-white p-3 rounded hover:bg-emerald-700">
          Login
        </button>
      </form>
    </div>
  );
}
