import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env: prefer server/.env next to this file, allow override via GROQ_ENV_PATH
const envPath = process.env.GROQ_ENV_PATH || path.resolve(__dirname, '.env')
dotenv.config({ path: envPath })
// fallback to legacy groq.env if needed
if (!process.env.GROQ_API_KEY || !process.env.GROQ_API_URL) {
  dotenv.config({ path: path.resolve(__dirname, 'groq.env') })
}

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// simple in-memory dataset for dev
let students = [
  { id: 1,  name: 'Ruhan',        course: 'Vue 3 Lab',             score: 95, semester: 'Spring 2025', status: 'Active' },
  { id: 2,  name: 'Rejuan',       course: 'Frontend Interaction',  score: 90, semester: 'Fall 2024',   status: 'Active' },
  { id: 3,  name: 'Ahmed',        course: 'Backend Basics',        score: 85, semester: 'Spring 2025', status: 'Inactive' },

  { id: 4,  name: 'Alice Chen',   course: 'Vue 3 Lab',             score: 88, semester: 'Spring 2025', status: 'Active' },
  { id: 5,  name: 'Bob Li',       course: 'Frontend Interaction',  score: 76, semester: 'Spring 2025', status: 'Active' },
  { id: 6,  name: 'Carlos Wang',  course: 'Backend Basics',        score: 82, semester: 'Fall 2024',   status: 'Inactive' },
  { id: 7,  name: 'Diana Zhang',  course: 'Data Visualization',    score: 91, semester: 'Spring 2024', status: 'Active' },
  { id: 8,  name: 'Eric Wu',      course: 'Data Visualization',    score: 73, semester: 'Fall 2024',   status: 'Active' },
  { id: 9,  name: 'Fatima Noor',  course: 'Algorithms',            score: 89, semester: 'Spring 2024', status: 'Active' },
  { id: 10, name: 'George Sun',   course: 'Algorithms',            score: 67, semester: 'Fall 2024',   status: 'Inactive' },

  { id: 11, name: 'Hannah Park',  course: 'Database Systems',      score: 92, semester: 'Spring 2025', status: 'Active' },
  { id: 12, name: 'Ivan Lee',     course: 'Database Systems',      score: 78, semester: 'Fall 2024',   status: 'Active' },
  { id: 13, name: 'Jenny Kim',    course: 'UI Design',             score: 94, semester: 'Spring 2024', status: 'Active' },
  { id: 14, name: 'Kevin Gu',     course: 'UI Design',             score: 81, semester: 'Fall 2025',   status: 'Inactive' },
  { id: 15, name: 'Lily Zhao',    course: 'Networks',              score: 87, semester: 'Spring 2025', status: 'Active' },
  { id: 16, name: 'Mario Rossi',  course: 'Networks',              score: 72, semester: 'Fall 2024',   status: 'Active' },

  { id: 17, name: 'Nadia Ali',    course: 'Cloud Computing',       score: 90, semester: 'Spring 2025', status: 'Active' },
  { id: 18, name: 'Oscar Liu',    course: 'Cloud Computing',       score: 84, semester: 'Fall 2025',   status: 'Active' },
  { id: 19, name: 'Priya Singh',  course: 'Vue 3 Lab',             score: 79, semester: 'Fall 2024',   status: 'Inactive' },
  { id: 20, name: 'Qi Zhang',     course: 'Frontend Interaction',  score: 93, semester: 'Spring 2024', status: 'Active' },

  { id: 21, name: 'Raj Patel',    course: 'Backend Basics',        score: 88, semester: 'Fall 2025',   status: 'Active' },
  { id: 22, name: 'Sara Müller',  course: 'Data Visualization',    score: 82, semester: 'Spring 2025', status: 'Inactive' },
  { id: 23, name: 'Tom Brown',    course: 'Algorithms',            score: 75, semester: 'Spring 2024', status: 'Active' },
  { id: 24, name: 'Uma Devi',     course: 'Database Systems',      score: 97, semester: 'Fall 2024',   status: 'Active' },
  { id: 25, name: 'Victor Chan',  course: 'UI Design',             score: 69, semester: 'Spring 2025', status: 'Inactive' },
  { id: 26, name: 'Wang Wei',     course: 'Networks',              score: 83, semester: 'Fall 2024',   status: 'Active' },

  { id: 27, name: 'Xiao Ming',    course: 'Vue 3 Lab',             score: 91, semester: 'Spring 2024', status: 'Active' },
  { id: 28, name: 'Yuki Tanaka',  course: 'Frontend Interaction',  score: 88, semester: 'Fall 2025',   status: 'Inactive' },
  { id: 29, name: 'Zara Khan',    course: 'Backend Basics',        score: 80, semester: 'Spring 2024', status: 'Active' },
  { id: 30, name: 'Ben Davis',    course: 'Cloud Computing',       score: 71, semester: 'Fall 2024',   status: 'Active' },

  { id: 31, name: 'Chen Hao',     course: 'Data Visualization',    score: 86, semester: 'Spring 2025', status: 'Active' },
  { id: 32, name: 'David Lee',    course: 'Algorithms',            score: 92, semester: 'Fall 2025',   status: 'Active' },
  { id: 33, name: 'Elena Petro',  course: 'Database Systems',      score: 77, semester: 'Spring 2024', status: 'Inactive' },
  { id: 34, name: 'Feng Yu',      course: 'UI Design',             score: 90, semester: 'Fall 2024',   status: 'Active' },
  { id: 35, name: 'Grace Liu',    course: 'Networks',              score: 85, semester: 'Spring 2025', status: 'Active' },

  { id: 36, name: 'Henry Zhao',   course: 'Vue 3 Lab',             score: 68, semester: 'Fall 2025',   status: 'Inactive' },
  { id: 37, name: 'Isabella Wu',  course: 'Frontend Interaction',  score: 96, semester: 'Spring 2025', status: 'Active' },
  { id: 38, name: 'Jack Ma',      course: 'Backend Basics',        score: 74, semester: 'Fall 2024',   status: 'Active' },
  { id: 39, name: 'Katrin Koch',  course: 'Cloud Computing',       score: 88, semester: 'Spring 2024', status: 'Inactive' },
  { id: 40, name: 'Leo Martin',   course: 'Data Visualization',    score: 81, semester: 'Fall 2025',   status: 'Active' },
]

// CRUD endpoints
app.get('/api/students', (req, res) => res.json(students))
app.post('/api/students', (req, res) => {
  const newStudent = { id: students.length + 1, ...req.body }
  students.push(newStudent)
  res.json(newStudent)
})
app.put('/api/students/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = students.findIndex(s => s.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Student not found' })
  students[idx] = { ...students[idx], ...req.body }
  res.json(students[idx])
})
app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id)
  students = students.filter(s => s.id !== id)
  res.json({ message: 'Deleted' })
})

// Full statistics for charts (Lab 3 & Lab 4)
app.get('/api/stats', (req, res) => {
  const list = students || []

  // 1) 课程平均分 (scoresByCourse)
  const byCourseMap = {}
  for (const s of list) {
    if (!byCourseMap[s.course]) {
      byCourseMap[s.course] = { course: s.course, total: 0, count: 0 }
    }
    byCourseMap[s.course].total += s.score || 0
    byCourseMap[s.course].count += 1
  }
  const scoresByCourse = Object.values(byCourseMap).map(c => ({
    course: c.course,
    avg: Number(c.total / c.count).toFixed(1),
  }))

  // 2) 课程参与度 (courseParticipation)
  const courseParticipation = Object.entries(
    list.reduce((acc, s) => {
      acc[s.course] = (acc[s.course] || 0) + 1
      return acc
    }, {})
  ).map(([course, count]) => ({ course, count }))

  // 3) 学期分布 (semesterDistribution)
  const semesterDistribution = Object.entries(
    list.reduce((acc, s) => {
      const sem = s.semester || 'Unknown'
      acc[sem] = (acc[sem] || 0) + 1
      return acc
    }, {})
  ).map(([semester, count]) => ({ semester, count }))

  // 4) 状态分布 (statusDist)
  const activeCount = list.filter(s => s.status === 'Active').length
  const inactiveCount = list.filter(s => s.status === 'Inactive').length
  const statusDist = [
    { name: 'Active', value: activeCount },
    { name: 'Inactive', value: inactiveCount },
  ]

  // 5) 平均成绩趋势 (avgTrend) - 按学期
  const bySemester = {}
  for (const s of list) {
    const key = s.semester || 'Unknown'
    if (!bySemester[key]) {
      bySemester[key] = { total: 0, count: 0 }
    }
    bySemester[key].total += s.score || 0
    bySemester[key].count += 1
  }
  const avgTrend = Object.entries(bySemester)
    .sort((a, b) => a[0].localeCompare(b[0]))  // sort by semester
    .map(([semester, agg]) => ({
      month: semester,
      avg: Number(agg.total / agg.count).toFixed(1),
    }))

  res.json({
    scoresByCourse,
    courseParticipation,
    semesterDistribution,
    statusDist,
    avgTrend,
  })
})

// Chatbot proxy with mock and DNS-friendly errors
app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ ok: false, error: 'Message is required' })

  // DEV mock fallback (set MOCK_GROQ=1 in server/.env during local dev)
  if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV == null) && process.env.MOCK_GROQ === '1') {
    return res.json({ ok: true, response: `Mock reply: "${message}"`, raw: { mocked: true } })
  }

  const apiKey = process.env.GROQ_API_KEY
  const groqUrl = process.env.GROQ_API_URL
  if (!apiKey || !groqUrl) {
    return res.status(500).json({
      ok: false,
      error: 'Server misconfiguration',
      detail: 'Set GROQ_API_KEY and GROQ_API_URL in server/.env'
    })
  }

  try {
    // Default body: many LLM endpoints accept { model, input } or { input }
    const body = { input: message }
    const resp = await axios.post(groqUrl, body, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    })

    const data = resp.data
    // normalize common shapes
    const text =
      data?.output_text ??
      data?.response ??
      data?.result ??
      data?.choices?.[0]?.message?.content ??
      data?.text ??
      JSON.stringify(data)

    res.json({ ok: true, response: text, raw: data })
  } catch (err) {
    // DNS resolution friendly message
    if (err.code === 'ENOTFOUND' || (err.message && err.message.includes('ENOTFOUND'))) {
      return res.status(502).json({
        ok: false,
        error: 'DNS resolution failed',
        detail: `Could not resolve host for GROQ_API_URL (${process.env.GROQ_API_URL}). Check DNS/network/proxy or provider endpoint.`
      })
    }
    const status = err?.response?.status || 500
    const detail = err?.response?.data || err.message || 'Unknown error'
    console.error('Groq API error:', detail)
    res.status(status).json({ ok: false, error: 'Groq API error', detail })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
})
