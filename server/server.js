// server/server.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- In-memory dataset ---
let students = [
  { id: 1, name: "Ruhan", course: "Vue 3 Lab", score: 95, semester: "Spring 2025", status: "Active" },
  { id: 2, name: "Rejuan", course: "Frontend Interaction", score: 90, semester: "Fall 2024", status: "Active" },
  { id: 3, name: "Ahmed", course: "Backend Basics", score: 85, semester: "Spring 2025", status: "Inactive" },
  { id: 4, name: "Zhang", course: "Computer", score: 55, semester: "Spring 2025", status: "Inactive" },
  { id: 5, name: "Farhan", course: "LAB4", score: 74, semester: "Spring 2025", status: "Active" },
  { id: 6, name: "Ming", course: "Mongo", score: 69, semester: "Summer 2025", status: "Active" },
  { id: 7, name: "Yu", course: "SQL", score: 56, semester: "Summer 2025", status: "Active" }
];

// --- Endpoints ---

// Get all students
app.get("/api/students", (req, res) => {
  res.json(students);
});

// Add new student
app.post("/api/students", (req, res) => {
  const newStudent = { id: students.length + 1, ...req.body };
  students.push(newStudent);
  res.json(newStudent);
});

// Update student
app.put("/api/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = students.findIndex(s => s.id === id);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...req.body };
    res.json(students[idx]);
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

// Delete student
app.delete("/api/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  students = students.filter(s => s.id !== id);
  res.json({ message: "Deleted" });
});

// Stats for Lab 3 & 4
app.get("/api/stats", (req, res) => {
  const scoresByCourse = Object.values(
    students.reduce((acc, s) => {
      if (!acc[s.course]) acc[s.course] = { course: s.course, total: 0, count: 0 };
      acc[s.course].total += s.score;
      acc[s.course].count += 1;
      return acc;
    }, {})
  ).map(e => ({ course: e.course, avg: (e.total / e.count).toFixed(2) }));

  const semesterDistribution = Object.values(
    students.reduce((acc, s) => {
      acc[s.semester] = (acc[s.semester] || 0) + 1;
      return acc;
    }, {})
  ).map((count, i, arr) => ({
    semester: Object.keys(
      students.reduce((a, s) => {
        a[s.semester] = (a[s.semester] || 0) + 1;
        return a;
      }, {})
    )[i],
    count
  }));

  const statusDist = [
    { name: "Active", value: students.filter(s => s.status === "Active").length },
    { name: "Inactive", value: students.filter(s => s.status === "Inactive").length }
  ];

  const courseParticipation = scoresByCourse.map(c => ({
    course: c.course,
    count: students.filter(s => s.course === c.course).length
  }));

  const avgTrend = [
    { month: "Jan", avg: 78 },
    { month: "Feb", avg: 81 },
    { month: "Mar", avg: 83 },
    { month: "Apr", avg: 80 },
    { month: "May", avg: 84 },
    { month: "Jun", avg: 88 }
  ];

  res.json({ scoresByCourse, semesterDistribution, statusDist, courseParticipation, avgTrend });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running with in-memory data at http://localhost:${PORT}`);
});
