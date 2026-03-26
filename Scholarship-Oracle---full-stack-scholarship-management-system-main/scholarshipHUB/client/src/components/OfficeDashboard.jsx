import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllScholarships, addScholarship, deleteScholarship, getAllStudents, getScholarshipApplications, getApplicationCounts, deleteStudent } from "../utils/api";


export default function OfficeDashboard() {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    provider: "",
    amount: "",
    eligibility: "",
    category: "Government",
    link: "", // Application link
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sRes, stRes, countsRes] = await Promise.all([
          getAllScholarships(), 
          getAllStudents(),
          getApplicationCounts()
        ]);
        setScholarships(sRes || []);
        setStudents(stRes || []);
        
        // Convert counts array to object for easy lookup
        const countsObj = {};
        countsRes.forEach(item => {
          countsObj[item._id] = item.count;
        });
        setApplicationCounts(countsObj);
      } catch (err) {
        console.error(err);
        setError("Failed to load data from server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openAdd = () => {
    setForm({ title: "", provider: "", amount: "", eligibility: "", category: "Government", link: "" });
    setError("");
    setSuccess("");
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.provider || !form.amount || !form.link) {
      setError("Please fill required fields (title, provider, amount, link).");
      return;
    }
    try {
      await addScholarship({ ...form, amount: Number(form.amount) });
      setSuccess("Scholarship added.");
      // refresh list
      const res = await getAllScholarships();
      setScholarships(res || []); // res is already response.data from api.js
      setTimeout(() => setShowAddModal(false), 600);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to add scholarship");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scholarship? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteScholarship(id);
      setSuccess("Scholarship deleted successfully.");
      // Refresh list
      const res = await getAllScholarships();
      setScholarships(res || []);
      // Refresh counts
      const countsRes = await getApplicationCounts();
      const countsObj = {};
      countsRes.forEach(item => {
        countsObj[item._id] = item.count;
      });
      setApplicationCounts(countsObj);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete scholarship");
    }
  };

  const handleDeleteStudent = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteStudent(id);
      setSuccess("Student deleted successfully.");
      // Refresh students list
      const res = await getAllStudents();
      setStudents(res || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete student");
    }
  };

  const handleViewApplications = async (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowApplicationsModal(true);
    try {
      const apps = await getScholarshipApplications(scholarship._id);
      setApplications(apps || []);
    } catch (err) {
      console.error("Error loading applications:", err);
      setError("Failed to load applications.");
    }
  };

  function downloadCSV() {
    if (!students || students.length === 0) return;
    const keys = Object.keys(students[0]).filter((k) => k !== "__v" && k !== "_id");
    const header = keys.join(",");
    const rows = students.map((s) =>
      keys.map((k) => {
        const v = s[k] === null || s[k] === undefined ? "" : String(s[k]);
        // escape quotes
        return `"${v.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-sky-200 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-blue-50"
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center text-sky-800 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Office Dashboard
        </motion.h1>
        <motion.p 
          className="text-center text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Manage scholarships, view students & track applications.
        </motion.p>

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              onClick={openAdd}
            >
              ➕ Add Scholarship
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 transition"
              onClick={() => downloadCSV()}
            >
              ⤓ Download Students CSV
            </motion.button>
          </div>

          <div className="flex gap-4 text-sm text-gray-700">
            <div className="bg-sky-50 px-4 py-2 rounded-md border border-sky-100">
              Scholarships: <span className="font-semibold">{scholarships.length}</span>
            </div>
            <div className="bg-sky-50 px-4 py-2 rounded-md border border-sky-100">
              Students: <span className="font-semibold">{students.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-pulse text-gray-500">Loading data...</div>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Scholarships</h2>
              {scholarships.length === 0 ? (
                <div className="text-gray-500">No scholarships yet.</div>
              ) : (
                <div className="grid gap-3">
                  <AnimatePresence>
                    {scholarships.map((s, index) => (
                      <motion.div
                        key={s._id || s.id || s.title}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.4,
                          type: "spring"
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0px 10px 25px rgba(14, 165, 233, 0.15)",
                          y: -2
                        }}
                        className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
                      >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-lg font-medium text-gray-800">{s.title}</div>
                          <div className="text-sm text-gray-500">{s.provider} • {s.category}</div>
                          <div className="text-sky-700 font-semibold mt-1">₹{Number(s.amount).toLocaleString()}</div>
                          {applicationCounts[s._id] > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {applicationCounts[s._id]} application{applicationCounts[s._id] !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleViewApplications(s)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                          >
                            View Applications ({applicationCounts[s._id] || 0})
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Registered Students</h2>
              {students.length === 0 ? (
                <motion.div 
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  No student registrations yet.
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-md overflow-hidden">
                    <thead className="bg-sky-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">USN</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Dept</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Income</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {students.map((st, index) => (
                          <motion.tr 
                            key={st._id} 
                            className="border-b last:border-b-0 hover:bg-sky-50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                          <td className="py-3 px-4">{st.name || "N/A"}</td>
                          <td className="py-3 px-4">{st.usn || "N/A"}</td>
                          <td className="py-3 px-4">{st.department || "N/A"}</td>
                          <td className="py-3 px-4">{st.category || "N/A"}</td>
                          <td className="py-3 px-4">{st.income ? `₹${Number(st.income).toLocaleString()}` : "N/A"}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteStudent(st._id, st.name)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          </>
        )}

        {/* Add Scholarship Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10"
            >
              <h3 className="text-xl font-semibold mb-3">Add Scholarship</h3>

              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

              <form onSubmit={submitAdd} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange}
                    className="w-full border rounded-md p-2 mt-1" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Provider *</label>
                  <input name="provider" value={form.provider} onChange={handleChange}
                    className="w-full border rounded-md p-2 mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600">Amount *</label>
                    <input 
                      name="amount" 
                      type="text" 
                      value={form.amount} 
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleChange({ target: { name: 'amount', value } });
                      }}
                      className="w-full border rounded-md p-2 mt-1" 
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      className="w-full border rounded-md p-2 mt-1">
                      <option>Government</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Eligibility / Notes</label>
                  <textarea name="eligibility" value={form.eligibility} onChange={handleChange}
                    className="w-full border rounded-md p-2 mt-1" rows={3} />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Application Link *</label>
                  <input name="link" type="url" value={form.link} onChange={handleChange}
                    placeholder="https://example.com/apply" 
                    className="w-full border rounded-md p-2 mt-1" required />
                  <p className="text-xs text-gray-500 mt-1">This link will be used for the "Apply Now" button</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-md border">Cancel</button>
                  <motion.button whileHover={{ scale: 1.03 }} type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white">Add</motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Applications Modal */}
        {showApplicationsModal && selectedScholarship && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowApplicationsModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl z-10 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Applications for: {selectedScholarship.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Eligibility: {selectedScholarship.eligibility || "Not specified"}
                  </p>
                </div>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No applications received for this scholarship yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-md">
                    <thead className="bg-sky-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Student Name</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">USN</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Applied Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id} className="border-b last:border-b-0 hover:bg-sky-50">
                          <td className="py-3 px-4">{app.student?.name || "N/A"}</td>
                          <td className="py-3 px-4">{app.student?.email || "N/A"}</td>
                          <td className="py-3 px-4">{app.student?.usn || "N/A"}</td>
                          <td className="py-3 px-4">{app.student?.department || "N/A"}</td>
                          <td className="py-3 px-4">{app.student?.category || "N/A"}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
