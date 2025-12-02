import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool, testConnection } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Test DB connection on startup
testConnection()

// ==================== CRUD Endpoints (MySQL) ====================

// GET all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching students:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// GET single student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Error fetching student:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// POST create new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, course, score, semester, status } = req.body

    if (!name || !course || !semester) {
      return res.status(400).json({ error: 'Name, course, and semester are required' })
    }

    const [result] = await pool.query(
      'INSERT INTO students (name, course, score, semester, status) VALUES (?, ?, ?, ?, ?)',
      [name, course, score || 0, semester, status || 'Active']
    )

    const [newStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId])
    console.log('✅ Student created:', newStudent[0])
    res.status(201).json(newStudent[0])
  } catch (err) {
    console.error('Error creating student:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// PUT update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, course, score, semester, status } = req.body

    const [existing] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Student not found' })
    }

    const updated = {
      name: name ?? existing[0].name,
      course: course ?? existing[0].course,
      score: score ?? existing[0].score,
      semester: semester ?? existing[0].semester,
      status: status ?? existing[0].status
    }

    await pool.query(
      'UPDATE students SET name = ?, course = ?, score = ?, semester = ?, status = ? WHERE id = ?',
      [updated.name, updated.course, updated.score, updated.semester, updated.status, id]
    )

    const [updatedStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    console.log('✅ Student updated:', updatedStudent[0])
    res.json(updatedStudent[0])
  } catch (err) {
    console.error('Error updating student:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    const [existing] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Student not found' })
    }

    await pool.query('DELETE FROM students WHERE id = ?', [id])
    console.log('✅ Student deleted:', existing[0])
    res.json({ message: 'Deleted', deleted: existing[0] })
  } catch (err) {
    console.error('Error deleting student:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// ==================== Stats Endpoint (MySQL) ====================

app.get('/api/stats', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students')

    // 1) Course average scores
    const scoresByCourse = Object.values(
      students.reduce((acc, s) => {
        if (!acc[s.course]) acc[s.course] = { course: s.course, total: 0, count: 0 }
        acc[s.course].total += s.score || 0
        acc[s.course].count += 1
        return acc
      }, {})
    ).map(c => ({ course: c.course, avg: Number(c.total / c.count).toFixed(1) }))

    // 2) Course participation count
    const courseParticipation = Object.entries(
      students.reduce((acc, s) => {
        acc[s.course] = (acc[s.course] || 0) + 1
        return acc
      }, {})
    ).map(([course, count]) => ({ course, count }))

    // 3) Semester distribution
    const semesterDistribution = Object.entries(
      students.reduce((acc, s) => {
        const sem = s.semester || 'Unknown'
        acc[sem] = (acc[sem] || 0) + 1
        return acc
      }, {})
    ).map(([semester, count]) => ({ semester, count }))

    // 4) Status distribution
    const activeCount = students.filter(s => s.status === 'Active').length
    const inactiveCount = students.filter(s => s.status === 'Inactive').length
    const statusDist = [
      { name: 'Active', value: activeCount },
      { name: 'Inactive', value: inactiveCount }
    ]

    // 5) Average trend by semester
    const bySemester = {}
    for (const s of students) {
      const key = s.semester || 'Unknown'
      if (!bySemester[key]) bySemester[key] = { total: 0, count: 0 }
      bySemester[key].total += s.score || 0
      bySemester[key].count += 1
    }
    const avgTrend = Object.entries(bySemester)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([semester, agg]) => ({
        month: semester,
        avg: Number(agg.total / agg.count).toFixed(1)
      }))

    res.json({ scoresByCourse, courseParticipation, semesterDistribution, statusDist, avgTrend })
  } catch (err) {
    console.error('Error fetching stats:', err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

// ==================== Chatbot Endpoint ====================

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ ok: false, error: 'Message is required' })

  if (process.env.MOCK_GROQ === '1') {
    return res.json({ ok: true, response: `Mock reply: "${message}"`, raw: { mocked: true } })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
    return res.status(500).json({
      ok: false,
      error: 'Server misconfiguration',
      detail: 'Set a valid GROQ_API_KEY in server/.env'
    })
  }

  try {
    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'qwen/qwen3-32b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_completion_tokens: 1024,
        top_p: 0.95,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    const data = resp.data
    const text = data?.choices?.[0]?.message?.content ?? JSON.stringify(data)
    res.json({ ok: true, response: text, raw: data })
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      return res.status(502).json({
        ok: false,
        error: 'DNS resolution failed',
        detail: 'Could not resolve api.groq.com. Check network/DNS settings.'
      })
    }
    const status = err?.response?.status || 500
    const detail = err?.response?.data?.error?.message || err?.response?.data || err.message
    console.error('Groq API error:', detail)
    res.status(status).json({ ok: false, error: 'Groq API error', detail })
  }
})

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
})
