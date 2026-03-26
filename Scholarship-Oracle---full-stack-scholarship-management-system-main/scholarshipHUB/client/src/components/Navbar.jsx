import React, { useContext, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setShowLogoutConfirm(false)
  }

  function handleHomeClick(e) {
    if (user) {
      e.preventDefault()
      setShowLogoutConfirm(true)
    }
  }

  function handleTitleClick(e) {
    if (user) {
      e.preventDefault()
      setShowLogoutConfirm(true)
    }
  }

  function handleConfirmLogout() {
    handleLogout()
  }

  function handleCancelLogout() {
    setShowLogoutConfirm(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav 
      className="w-full bg-white shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {user ? (
            <button
              onClick={handleTitleClick}
              className="font-bold text-xl text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
            >
              Scholarship Hub
            </button>
          ) : (
            <Link to="/" className="font-bold text-xl text-sky-700">
              Scholarship Hub
            </Link>
          )}
        </motion.div>
        <div className="flex items-center space-x-6">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <button
                onClick={handleHomeClick}
                className={`text-slate-600 hover:text-sky-700 transition-colors ${isActive('/') ? 'text-sky-700 font-semibold' : ''}`}
              >
                Home
              </button>
            ) : (
              <Link 
                to="/" 
                className={`text-slate-600 hover:text-sky-700 transition-colors ${isActive('/') ? 'text-sky-700 font-semibold' : ''}`}
              >
                Home
              </Link>
            )}
          </motion.div>
          
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={user.email ? (user.email.includes('@') ? "/student/dashboard" : "/office/dashboard") : "/student/dashboard"}
                  className={`text-sky-600 hover:text-sky-700 transition-colors ${location.pathname.includes('dashboard') ? 'font-semibold' : ''}`}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutConfirm(true)}
                className="text-slate-600 hover:text-sky-700 transition-colors"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/student" className="text-slate-600 hover:text-sky-700 transition-colors">
                Student Login
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/30" 
              onClick={handleCancelLogout}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-10"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You will need to login again to access your dashboard.
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelLogout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}