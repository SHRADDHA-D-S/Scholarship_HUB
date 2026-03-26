import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100">
      {/* Title Section */}
      <motion.h1
        className="text-5xl font-extrabold text-sky-700 mb-4"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to Scholarship Hub
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-10 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Login to access your dashboard
      </motion.p>

      {/* Buttons */}
      <div className="flex gap-6">
        {/* Student Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/student")}
          className="bg-sky-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-sky-700 transition duration-300"
        >
          Student Login
        </motion.button>

        {/* Office Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/office/login")}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition duration-300"
        >
          Office Login
        </motion.button>
      </div>

      <motion.footer
        className="mt-16 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />
    </div>
  );
}
