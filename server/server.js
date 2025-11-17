// server/server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// prefer explicit path, default to ./server/.env (loaded from project root),
// fall back to legacy groq.env if needed
const envPath = process.env.GROQ_ENV_PATH || "./server/.env";
dotenv.config({ path: envPath });

// if essential vars still missing, try legacy groq.env (best-effort, no overwrite if already set)
if (!process.env.GROQ_API_KEY || !process.env.GROQ_API_URL) {
  dotenv.config({ path: "./groq.env" });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory dataset
let students = [
  { id: 1, name: "Ruhan", course: "Vue 3 Lab", score: 95, semester: "Spring 2025", status: "Active" },
  { id: 2, name: "Rejuan", course: "Frontend Interaction", score: 90, semester: "Fall 2024", status: "Active" },
  { id: 3, name: "Ahmed", course: "Backend Basics", score: 85, semester: "Spring 2025", status: "Inactive" },
  { id: 4, name: "Zhang", course: "Computer", score: 55, semester: "Spring 2025", status: "Inactive" },
  { id: 5, name: "Farhan", course: "LAB4", score: 74, semester: "Spring 2025", status: "Active" },
  { id: 6, name: "Ming", course: "Mongo", score: 69, semester: "Summer 2025", status: "Active" },
  { id: 7, name: "Yu", course: "SQL", score: 56, semester: "Summer 2025", status: "Active" }
];

// Endpoints
app.get("/api/students", (req, res) => {
  res.json(students);
});

app.post("/api/students", (req, res) => {
  const newStudent = { id: students.length + 1, ...req.body };
  students.push(newStudent);
  res.json(newStudent);
});

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

app.delete("/api/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  students = students.filter(s => s.id !== id);
  res.json({ message: "Deleted" });
});

app.get("/api/stats", (req, res) => {
  const scoresByCourse = Object.values(
    students.reduce((acc, s) => {
      if (!acc[s.course]) acc[s.course] = { course: s.course, total: 0, count: 0 };
      acc[s.course].total += s.score;
      acc[s.course].count += 1;
      return acc;
    }, {})
  ).map(e => ({ course: e.course, avg: (e.total / e.count).toFixed(2) }));

  const semesterCounts = students.reduce((acc, s) => {
    acc[s.semester] = (acc[s.semester] || 0) + 1;
    return acc;
  }, {});
  const semesterDistribution = Object.entries(semesterCounts).map(([semester, count]) => ({ semester, count }));

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

app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ ok: false, error: "Message is required" });

  const apiKey = process.env.GROQ_API_KEY;
  const groqUrl = process.env.GROQ_API_URL;

  if (!apiKey || !groqUrl) {
    console.error("GROQ env vars missing");
    return res.status(500).json({
      ok: false,
      error: "Server misconfiguration",
      detail: "Set GROQ_API_KEY and GROQ_API_URL in server/.env (or groq.env)"
    });
  }

  try {
    const response = await axios.post(
      groqUrl,
      { input: message },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const respBody = response.data;
    const responseText =
      respBody?.response ??
      respBody?.result ??
      respBody?.choices?.[0]?.message?.content ??
      respBody?.text ??
      JSON.stringify(respBody);

    console.log("Groq response (normalized):", typeof responseText === "string" ? responseText.slice(0, 100) : "[object]");
    res.json({ ok: true, response: responseText, raw: respBody });
  } catch (err) {
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || err.message || "Unknown error";
    console.error("Groq API error:", detail);
    res.status(status).json({ ok: false, error: "Groq API error", detail });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running with in-memory data at http://localhost:${PORT}`);
});
