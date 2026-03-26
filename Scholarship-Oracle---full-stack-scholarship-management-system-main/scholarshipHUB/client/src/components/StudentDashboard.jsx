import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchScholarships, applyToScholarship, updateStudentProfile } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import ScholarshipChatbot from "./ScholarshipChatbot";

const StudentDashboard = () => {
  const { user, login, token } = useContext(AuthContext);
  const student = user; // user is already the student/office object from AuthContext

  const [showType, setShowType] = useState("government");
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [editForm, setEditForm] = useState({
    usn: "",
    department: "",
    category: "",
    income: ""
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    async function loadScholarships() {
      setLoading(true);
      try {
        const data = await fetchScholarships(); // fetchScholarships doesn't take parameters
        // Filter by type on the frontend
        const filtered = data.filter(s => 
          s.category?.toLowerCase() === showType || 
          (showType === "government" && !s.category?.toLowerCase().includes("private"))
        );
        setScholarships(filtered);
      } catch (err) {
        console.error("Error loading scholarships:", err);
      }
      setLoading(false);
    }
    loadScholarships();
  }, [showType]);

  // Initialize edit form with current student data
  useEffect(() => {
    if (student) {
      setEditForm({
        usn: student.usn || "",
        department: student.department || "",
        category: student.category || "",
        income: student.income || ""
      });
    }
  }, [student]);

  const handleOpenEdit = () => {
    setEditForm({
      usn: student?.usn || "",
      department: student?.department || "",
      category: student?.category || "",
      income: student?.income || ""
    });
    setShowEditModal(true);
    setUpdateError("");
    setUpdateSuccess("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const studentId = student._id || student.id;
      if (!studentId) {
        setUpdateError("Student ID not found. Please log out and log in again.");
        setUpdating(false);
        return;
      }

      const updatedStudent = await updateStudentProfile(studentId, editForm);
      
      // Update the user in context - AuthContext expects { student: {...}, token: ... }
      const updatedUser = { ...student, ...updatedStudent };
      login({ student: updatedUser, token: token });
      
      setUpdateSuccess("Profile updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setUpdateSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const eligible = scholarships.filter((s) => {
    // Safety check for missing fields
    if (!student || !s) return false;
    if (!s.department) return true; // If no department specified, show to all
    const depts = s.department.split(",").map((d) => d.trim());
    return (
      depts.includes("All") || 
      (student.department && depts.includes(student.department))
    );
  });

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 py-10 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <motion.h1 
          className="text-3xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Welcome,{" "}
          <motion.span 
            className="text-sky-600 bg-sky-50 px-2 py-1 rounded-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
          >
            {student?.name || "Student"}!
          </motion.span>
        </motion.h1>
        <motion.p 
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Explore and apply for scholarships that match your academic profile.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Scholarships Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex mb-6 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowType("government")}
                  className={`px-5 py-2.5 rounded-md mx-2 transition-all duration-300 ${
                    showType === "government"
                      ? "bg-sky-600 text-white shadow-md"
                      : "text-gray-700 bg-sky-50 hover:bg-sky-100"
                  }`}
                >
                  Government
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowType("private")}
                  className={`px-5 py-2.5 rounded-md mx-2 transition-all duration-300 ${
                    showType === "private"
                      ? "bg-sky-600 text-white shadow-md"
                      : "text-gray-700 bg-sky-50 hover:bg-sky-100"
                  }`}
                >
                  Private
                </motion.button>
              </div>

              {loading ? (
                <motion.div 
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Fetching scholarships...
                </motion.div>
              ) : eligible.length === 0 ? (
                <motion.div 
                  className="text-sm text-gray-500 text-center py-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  No matching scholarships found for your profile.
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {eligible.map((sc, index) => (
                      <motion.div
                        key={sc._id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.4,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0px 10px 25px rgba(14, 165, 233, 0.15)"
                        }}
                        className="p-5 bg-sky-50 border border-sky-100 rounded-lg hover:shadow-lg transition-all"
                      >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedScholarship(sc);
                            setShowEligibilityModal(true);
                          }}
                        >
                          <h5 className="font-semibold text-gray-900 mb-1 hover:text-sky-700 transition-colors">
                            {sc.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {sc.category && <>Category: {sc.category} <br /></>}
                            {sc.department && <>Department: {sc.department} <br /></>}
                            {sc.amount && <>Amount: ₹{Number(sc.amount).toLocaleString()} <br /></>}
                            {sc.deadline && <>Deadline: {new Date(sc.deadline).toLocaleDateString()}</>}
                            {sc.description && <><br />{sc.description}</>}
                            {sc.eligibility && (
                              <span className="text-xs text-sky-600 mt-2 inline-block">
                                Click to view eligibility →
                              </span>
                            )}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ 
                            scale: 1.1,
                            boxShadow: "0px 5px 15px rgba(14, 165, 233, 0.4)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent modal from opening when clicking Apply button
                            if (applying) return;
                            
                            if (!sc.link) {
                              alert("Application link not available. Please contact the office.");
                              return;
                            }

                            if (!student) {
                              alert("Please make sure you're logged in.");
                              return;
                            }

                            // Get student ID - MongoDB uses _id
                            // Check all possible ID fields
                            const studentId = student._id || student.id || (student.student && student.student._id) || (student.student && student.student.id);
                            
                            if (!studentId) {
                              console.error("Student ID not found in:", student);
                              alert("Student ID not found. Please log out and log in again.");
                              return;
                            }

                            setApplying(true);
                            try {
                              // Try to create application record in database (only if it doesn't exist)
                              // This prevents duplicate entries but allows multiple clicks
                              try {
                                await applyToScholarship(studentId, sc._id);
                              } catch (err) {
                                // If already applied, that's okay - we still want to redirect
                                if (!err.response?.data?.message?.includes("already applied")) {
                                  console.error("Error creating application:", err);
                                  // Only show error if it's not a duplicate
                                  throw err;
                                }
                              }
                              
                              // Always redirect to external link (even if already applied)
                              window.open(sc.link, '_blank', 'noopener,noreferrer');
                            } catch (err) {
                              console.error("Application error:", err);
                              console.error("Error details:", err.response?.data);
                              const errorMsg = err.response?.data?.message || err.message || "Failed to submit application. Please try again.";
                              alert(`Error: ${errorMsg}`);
                            } finally {
                              setApplying(false);
                            }
                          }}
                          disabled={applying}
                          className="px-4 py-2 bg-sky-600 text-white text-sm rounded-md hover:bg-sky-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applying ? "Applying..." : "Apply Now"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: 20, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              rotateY: 2
            }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-semibold text-gray-900 text-lg">
                🎓 Student Profile
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenEdit}
                className="text-xs px-3 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all"
              >
                Edit
              </motion.button>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-gray-500">Email:</span>
                <br />
                <span className="font-medium text-gray-800">
                  {student.email || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">USN:</span>
                <br />
                <span className="font-medium text-gray-800">
                  {student.usn || "Not set"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Department:</span>
                <br />
                <span className="font-medium text-gray-800">
                  {student.department || "Not set"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Category:</span>
                <br />
                <span className="font-medium text-gray-800">
                  {student.category || "Not set"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Annual Income:</span>
                <br />
                <span className="font-medium text-gray-800">
                  {student.income ? `₹${parseInt(student.income).toLocaleString()}` : "Not set"}
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* AI Chatbot */}
      <ScholarshipChatbot currentStudent={student} />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEditModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-10"
          >
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

            {updateError && (
              <div className="text-red-500 text-sm mb-3 p-2 bg-red-50 rounded">
                {updateError}
              </div>
            )}
            {updateSuccess && (
              <div className="text-green-600 text-sm mb-3 p-2 bg-green-50 rounded">
                {updateSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  USN
                </label>
                <input
                  type="text"
                  value={editForm.usn}
                  onChange={(e) => setEditForm({ ...editForm, usn: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-sky-500 focus:ring focus:ring-sky-200"
                  placeholder="Enter USN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-sky-500 focus:ring focus:ring-sky-200"
                  placeholder="Enter Department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-sky-500 focus:ring focus:ring-sky-200"
                  placeholder="Enter Category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={editForm.income}
                  onChange={(e) => setEditForm({ ...editForm, income: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-sky-500 focus:ring focus:ring-sky-200"
                  placeholder="Enter Annual Income"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                  disabled={updating}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Eligibility Modal */}
      {showEligibilityModal && selectedScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEligibilityModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl z-10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedScholarship.title}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedScholarship.provider && (
                    <p><span className="font-medium">Provider:</span> {selectedScholarship.provider}</p>
                  )}
                  {selectedScholarship.category && (
                    <p><span className="font-medium">Category:</span> {selectedScholarship.category}</p>
                  )}
                  {selectedScholarship.amount && (
                    <p><span className="font-medium">Amount:</span> ₹{Number(selectedScholarship.amount).toLocaleString()}</p>
                  )}
                  {selectedScholarship.department && (
                    <p><span className="font-medium">Department:</span> {selectedScholarship.department}</p>
                  )}
                  {selectedScholarship.deadline && (
                    <p><span className="font-medium">Deadline:</span> {new Date(selectedScholarship.deadline).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
              {selectedScholarship.eligibility ? (
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedScholarship.eligibility}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-500 italic">
                    No specific eligibility criteria has been provided for this scholarship.
                  </p>
                </div>
              )}
            </div>

            {selectedScholarship.description && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedScholarship.description}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEligibilityModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all"
              >
                Close
              </motion.button>
              {selectedScholarship.link && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!student) {
                      alert("Please make sure you're logged in.");
                      return;
                    }

                    const studentId = student._id || student.id;
                    if (!studentId) {
                      alert("Student ID not found. Please log out and log in again.");
                      return;
                    }

                    setApplying(true);
                    try {
                      try {
                        await applyToScholarship(studentId, selectedScholarship._id);
                      } catch (err) {
                        if (!err.response?.data?.message?.includes("already applied")) {
                          throw err;
                        }
                      }
                      window.open(selectedScholarship.link, '_blank', 'noopener,noreferrer');
                      setShowEligibilityModal(false);
                    } catch (err) {
                      console.error("Application error:", err);
                      const errorMsg = err.response?.data?.message || err.message || "Failed to submit application.";
                      alert(`Error: ${errorMsg}`);
                    } finally {
                      setApplying(false);
                    }
                  }}
                  disabled={applying}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Applying..." : "Apply Now"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
