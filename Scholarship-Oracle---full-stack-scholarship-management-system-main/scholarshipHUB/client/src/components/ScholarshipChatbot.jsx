import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchScholarships, getAllStudents, getApplicationCounts, getScholarshipApplications } from "../utils/api";

const ScholarshipChatbot = ({ currentStudent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Scholarship Hub assistant. I can help you with information about scholarships, student details, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const [scholarshipsData, studentsData, countsData] = await Promise.all([
        fetchScholarships(),
        getAllStudents(),
        getApplicationCounts(),
      ]);
      setScholarships(scholarshipsData || []);
      setStudents(studentsData || []);
      
      // Convert counts array to object for easy lookup
      const countsObj = {};
      countsData.forEach(item => {
        countsObj[item._id] = item.count;
      });
      setApplicationCounts(countsObj);
    } catch (err) {
      console.error("Error loading data for chatbot:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processQuestion = (question) => {
    const lowerQuestion = question.toLowerCase().trim();
    let response = "";

    // Count questions - improved pattern matching (check this first before other patterns)
    // Handle variations like "how many", "number of", "how number of", "count", etc.
    const isCountQuestion = lowerQuestion.includes("scholarship") && (
      lowerQuestion.includes("how many") || 
      lowerQuestion.includes("number of") || 
      lowerQuestion.includes("how number") || // Handle "how number of" typo
      lowerQuestion.includes("count") || 
      (lowerQuestion.includes("available") && lowerQuestion.length < 60) || // Short questions with "available"
      (lowerQuestion.includes("total") && lowerQuestion.includes("scholarship")) ||
      (lowerQuestion.includes("have") && lowerQuestion.includes("scholarship"))
    );
    
    if (isCountQuestion) {
      if (lowerQuestion.includes("applied") || lowerQuestion.includes("application")) {
        // Questions about applications
        const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0);
        if (totalApplications === 0) {
          response = "No students have applied to any scholarships yet.";
        } else {
          response = `A total of ${totalApplications} application${totalApplications !== 1 ? "s" : ""} have been received across all scholarships.`;
          // Show breakdown by scholarship
          const scholarshipNames = [];
          scholarships.forEach(s => {
            if (applicationCounts[s._id] > 0) {
              scholarshipNames.push(`${s.title} (${applicationCounts[s._id]} application${applicationCounts[s._id] !== 1 ? "s" : ""})`);
            }
          });
          if (scholarshipNames.length > 0) {
            response += `\n\nBreakdown:\n${scholarshipNames.join("\n")}`;
          }
        }
      } else {
        const count = scholarships.length;
        response = `There are currently ${count} scholarship${count !== 1 ? "s" : ""} available in the system.`;
        if (count > 0) {
          const govCount = scholarships.filter((s) => s.category?.toLowerCase() === "government" || !s.category?.toLowerCase().includes("private")).length;
          const privCount = scholarships.filter((s) => s.category?.toLowerCase() === "private").length;
          response += ` ${govCount} government scholarship${govCount !== 1 ? "s" : ""} and ${privCount} private scholarship${privCount !== 1 ? "s" : ""}.`;
        }
      }
    } else if ((lowerQuestion.includes("how many") || lowerQuestion.includes("number of") || lowerQuestion.includes("how number") || lowerQuestion.includes("count")) && lowerQuestion.includes("student")) {
      if (lowerQuestion.includes("applied") || lowerQuestion.includes("application")) {
        const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0);
        response = `${totalApplications} student${totalApplications !== 1 ? "s have" : " has"} applied to scholarships in the system.`;
      } else {
        const count = students.length;
        response = `There are currently ${count} registered student${count !== 1 ? "s" : ""} in the system.`;
      }
    } else if (lowerQuestion.includes("scholarship") && (lowerQuestion.includes("upload") || lowerQuestion.includes("added"))) {
      const count = scholarships.length;
      response = `The office has uploaded ${count} scholarship${count !== 1 ? "s" : ""} to the system.`;
    }
    // Student details questions
    else if (lowerQuestion.includes("my") && (lowerQuestion.includes("detail") || lowerQuestion.includes("info") || lowerQuestion.includes("profile"))) {
      if (currentStudent) {
        response = `Your student details:\n`;
        response += `Name: ${currentStudent.name || "N/A"}\n`;
        response += `Email: ${currentStudent.email || "N/A"}\n`;
        if (currentStudent.usn) response += `USN: ${currentStudent.usn}\n`;
        if (currentStudent.department) response += `Department: ${currentStudent.department}\n`;
        if (currentStudent.category) response += `Category: ${currentStudent.category}\n`;
        if (currentStudent.income) response += `Annual Income: ₹${Number(currentStudent.income).toLocaleString()}`;
      } else {
        response = "I couldn't find your student details. Please make sure you're logged in.";
      }
    }
    // Scholarship name questions by category
    else if (lowerQuestion.includes("name") && lowerQuestion.includes("scholarship")) {
      if (lowerQuestion.includes("private")) {
        const privateScholarships = scholarships.filter(s => 
          s.category?.toLowerCase() === "private"
        );
        if (privateScholarships.length === 0) {
          response = "There are no private scholarships available at the moment.";
        } else {
          response = `Here are the private scholarships:\n\n`;
          privateScholarships.forEach((s, idx) => {
            response += `${idx + 1}. ${s.title}`;
            if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
            if (s.provider) response += ` (${s.provider})`;
            response += `\n`;
          });
        }
      } else if (lowerQuestion.includes("government") || lowerQuestion.includes("govt")) {
        const govtScholarships = scholarships.filter(s => 
          s.category?.toLowerCase() === "government" || 
          (!s.category?.toLowerCase().includes("private") && s.category)
        );
        if (govtScholarships.length === 0) {
          response = "There are no government scholarships available at the moment.";
        } else {
          response = `Here are the government scholarships:\n\n`;
          govtScholarships.forEach((s, idx) => {
            response += `${idx + 1}. ${s.title}`;
            if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
            if (s.provider) response += ` (${s.provider})`;
            response += `\n`;
          });
        }
      } else {
        // General name question
        if (scholarships.length === 0) {
          response = "There are no scholarships available at the moment.";
        } else {
          response = `Here are the available scholarships:\n\n`;
          scholarships.slice(0, 10).forEach((s, idx) => {
            response += `${idx + 1}. ${s.title}`;
            if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
            if (s.category) response += ` (${s.category})`;
            response += `\n`;
          });
          if (scholarships.length > 10) {
            response += `\n...and ${scholarships.length - 10} more.`;
          }
        }
      }
    }
    // Scholarship list questions
    else if (lowerQuestion.includes("list") || lowerQuestion.includes("show") || lowerQuestion.includes("what are")) {
      if (lowerQuestion.includes("scholarship")) {
        if (lowerQuestion.includes("private")) {
          const privateScholarships = scholarships.filter(s => 
            s.category?.toLowerCase() === "private"
          );
          if (privateScholarships.length === 0) {
            response = "There are no private scholarships available at the moment.";
          } else {
            response = `Here are the private scholarships:\n\n`;
            privateScholarships.forEach((s, idx) => {
              response += `${idx + 1}. ${s.title}`;
              if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
              if (s.provider) response += ` (${s.provider})`;
              response += `\n`;
            });
          }
        } else if (lowerQuestion.includes("government") || lowerQuestion.includes("govt")) {
          const govtScholarships = scholarships.filter(s => 
            s.category?.toLowerCase() === "government" || 
            (!s.category?.toLowerCase().includes("private") && s.category)
          );
          if (govtScholarships.length === 0) {
            response = "There are no government scholarships available at the moment.";
          } else {
            response = `Here are the government scholarships:\n\n`;
            govtScholarships.forEach((s, idx) => {
              response += `${idx + 1}. ${s.title}`;
              if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
              if (s.provider) response += ` (${s.provider})`;
              response += `\n`;
            });
          }
        } else {
          if (scholarships.length === 0) {
            response = "There are no scholarships available at the moment.";
          } else {
            response = `Here are the available scholarships:\n\n`;
            scholarships.slice(0, 5).forEach((s, idx) => {
              response += `${idx + 1}. ${s.title}`;
              if (s.amount) response += ` - ₹${Number(s.amount).toLocaleString()}`;
              if (s.category) response += ` (${s.category})`;
              response += `\n`;
            });
            if (scholarships.length > 5) {
              response += `\n...and ${scholarships.length - 5} more.`;
            }
          }
        }
      }
    }
    // Amount/total questions
    else if (lowerQuestion.includes("total") || lowerQuestion.includes("amount") || lowerQuestion.includes("value")) {
      if (lowerQuestion.includes("scholarship")) {
        const total = scholarships.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        response = `The total value of all scholarships is ₹${total.toLocaleString()}.`;
        if (scholarships.length > 0) {
          const avg = Math.round(total / scholarships.length);
          response += ` The average scholarship amount is ₹${avg.toLocaleString()}.`;
        }
      }
    }
    // Eligibility questions
    else if (lowerQuestion.includes("eligible") || lowerQuestion.includes("eligibility") || lowerQuestion.includes("qualify") || lowerQuestion.includes("criteria")) {
      if (lowerQuestion.includes("criteria") || lowerQuestion.includes("requirement")) {
        // Asking about eligibility criteria
        if (lowerQuestion.includes("for") || lowerQuestion.includes("scholarship")) {
          // Extract scholarship name if mentioned
          const mentionedScholarship = scholarships.find(s => 
            lowerQuestion.includes(s.title.toLowerCase())
          );
          if (mentionedScholarship) {
            response = `Eligibility criteria for "${mentionedScholarship.title}":\n`;
            if (mentionedScholarship.eligibility) {
              response += mentionedScholarship.eligibility;
            } else {
              response += "No specific eligibility criteria has been set for this scholarship.";
            }
            if (mentionedScholarship.department) {
              response += `\n\nDepartment: ${mentionedScholarship.department}`;
            }
            if (mentionedScholarship.category) {
              response += `\nCategory: ${mentionedScholarship.category}`;
            }
          } else {
            response = "Here are the eligibility criteria for available scholarships:\n\n";
            scholarships.slice(0, 5).forEach((s, idx) => {
              response += `${idx + 1}. ${s.title}:\n`;
              if (s.eligibility) {
                response += `   ${s.eligibility}\n`;
              } else {
                response += `   No specific criteria set\n`;
              }
              if (s.department) response += `   Department: ${s.department}\n`;
              if (s.category) response += `   Category: ${s.category}\n`;
              response += "\n";
            });
            if (scholarships.length > 5) {
              response += `...and ${scholarships.length - 5} more scholarships.`;
            }
          }
        } else {
          response = "I can tell you about eligibility criteria for scholarships. You can ask:\n";
          response += "• 'What is the eligibility criteria for [scholarship name]?'\n";
          response += "• 'Show me eligibility criteria for all scholarships'";
        }
      } else if (currentStudent) {
        const eligibleCount = scholarships.filter((s) => {
          if (!s.department) return true;
          const depts = s.department.split(",").map((d) => d.trim());
          return depts.includes("All") || (currentStudent.department && depts.includes(currentStudent.department));
        }).length;
        response = `Based on your profile, you are eligible for ${eligibleCount} out of ${scholarships.length} scholarship${scholarships.length !== 1 ? "s" : ""}.`;
      } else {
        response = "I need your student details to check eligibility. Please make sure you're logged in.";
      }
    }
    // Where to find applications
    else if (lowerQuestion.includes("where") && (lowerQuestion.includes("find") || lowerQuestion.includes("see") || lowerQuestion.includes("view")) && (lowerQuestion.includes("application") || lowerQuestion.includes("applied") || lowerQuestion.includes("student"))) {
      response = "To view the list of students who applied to scholarships:\n\n";
      response += "1. Go to the Office Dashboard\n";
      response += "2. In the Scholarships section, you'll see each scholarship with an application count\n";
      response += "3. Click the 'View Applications' button next to any scholarship\n";
      response += "4. A modal will open showing all students who applied to that scholarship\n\n";
      response += "The list includes:\n";
      response += "• Student name and email\n";
      response += "• USN and department\n";
      response += "• Application status (Pending/Approved/Rejected)\n";
      response += "• Date of application";
    }
    // Help/greeting
    else if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi") || lowerQuestion.includes("help")) {
      response = "Hello! I can help you with:\n";
      response += "• Number of scholarships available\n";
      response += "• Number of students who applied\n";
      response += "• Eligibility criteria for scholarships\n";
      response += "• Your student details\n";
      response += "• Scholarship information\n";
      response += "• Where to find application lists\n";
      response += "• Total scholarship amounts\n";
      response += "\nJust ask me anything about the Scholarship Hub!";
    }
    // Default response for project-related questions
    else if (
      lowerQuestion.includes("scholarship") ||
      lowerQuestion.includes("student") ||
      lowerQuestion.includes("office") ||
      lowerQuestion.includes("application") ||
      lowerQuestion.includes("hub")
    ) {
      response = "I can help you with information about scholarships, students, and the Scholarship Hub system. Could you be more specific? For example:\n";
      response += "• 'How many scholarships are available?'\n";
      response += "• 'Show me my student details'\n";
      response += "• 'What scholarships am I eligible for?'";
    }
    // Non-project related questions
    else {
      response = "I'm designed to help you with information about the Scholarship Hub project only. I can answer questions about:\n";
      response += "• Scholarships (count, details, amounts)\n";
      response += "• Student information\n";
      response += "• Eligibility and applications\n";
      response += "\nPlease ask me something related to the Scholarship Hub!";
    }

    return response;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Process and get response
    const response = processQuestion(userMessage);

    // Add assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <>
      {/* Chatbot Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-sky-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-semibold">Scholarship Hub Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close chatbot"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about scholarships, students, etc..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScholarshipChatbot;

