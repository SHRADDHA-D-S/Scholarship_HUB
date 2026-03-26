import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api"; // Backend base URL

// 🔹 Student Login
export const studentLogin = async (credentials) => {
  try {
    // Backend expects email, but frontend sends username - map it
    const response = await axios.post(`${API_BASE_URL}/auth/student/login`, {
      email: credentials.username, // Map username to email
      password: credentials.password,
    });

    // Ensure student object has _id
    if (response.data && response.data.student) {
      console.log("Login response student:", response.data.student);
    }

    return response.data;
  } catch (error) {
    console.error("Student login error:", error);
    if (
      error.code === "ECONNREFUSED" ||
      (error.message && error.message.includes("Network Error"))
    ) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on port 4000."
      );
    }
    throw error;
  }
};

// 🔹 Student Signup
export const studentSignup = async (formData) => {
  try {
    // Backend expects name, email, password, usn, department, category, income
    const response = await axios.post(`${API_BASE_URL}/auth/student/register`, {
      name: formData.name,
      email: formData.username, // Map username to email
      password: formData.password,
      usn: formData.usn || "",
      department: formData.department || "",
      category: formData.category || "",
      income: formData.income || null,
    });
    return response.data;
  } catch (error) {
    console.error("Student signup error:", error);
    if (
      error.code === "ECONNREFUSED" ||
      (error.message && error.message.includes("Network Error"))
    ) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on port 4000."
      );
    }
    throw error;
  }
};

// 🔹 Office Login
export const officeLogin = async (credentials) => {
  try {
    // Backend expects email, but frontend sends username - map it
    const response = await axios.post(`${API_BASE_URL}/auth/office/login`, {
      email: credentials.username, // Map username to email
      password: credentials.password,
    });
    return response.data;
  } catch (error) {
    console.error("Office login error:", error);
    if (
      error.code === "ECONNREFUSED" ||
      (error.message && error.message.includes("Network Error"))
    ) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on port 4000."
      );
    }
    throw error;
  }
};

// 🔹 Office Signup
export const officeSignup = async (formData) => {
  try {
    // Backend expects officeName, email, password
    const response = await axios.post(`${API_BASE_URL}/auth/office/register`, {
      officeName: formData.username, // Map username to officeName
      email: formData.username,      // Using username as email for now
      password: formData.password,
    });
    return response.data;
  } catch (error) {
    console.error("Office signup error:", error);
    if (
      error.code === "ECONNREFUSED" ||
      (error.message && error.message.includes("Network Error"))
    ) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on port 4000."
      );
    }
    throw error;
  }
};

// 🔹 Get all students (for office dashboard)
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students`);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// 🔹 Update student profile
export const updateStudentProfile = async (studentId, profileData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/students/${studentId}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
};

// 🔹 Delete student (for office dashboard)
export const deleteStudent = async (studentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/students/${studentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

// 🔹 Get all scholarships (for both dashboards)
export const getAllScholarships = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scholarships`);
    return response.data;
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    throw error;
  }
};

// 🔹 Fetch scholarships (for student dashboard)
export const fetchScholarships = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scholarships`);
    return response.data;
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    throw error;
  }
};

// 🔹 Add new scholarship (for office dashboard)
export const addScholarship = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scholarships`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding scholarship:", error);
    throw error;
  }
};

// 🔹 Delete scholarship (for office dashboard)
export const deleteScholarship = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/scholarships/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    throw error;
  }
};

// 🔹 Get applications for a scholarship
export const getScholarshipApplications = async (scholarshipId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/applications/scholarship/${scholarshipId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

// 🔹 Get application counts
export const getApplicationCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applications/counts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching application counts:", error);
    throw error;
  }
};

// 🔹 Apply to a scholarship
export const applyToScholarship = async (studentId, scholarshipId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/applications`, {
      studentId,
      scholarshipId,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying to scholarship:", error);
    throw error;
  }
};
