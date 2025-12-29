import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool, testConnection } from './db.js'
import { studentSchema } from './schemas/student.js'

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
    // Validate input using Zod
    const validatedData = studentSchema.parse(req.body)
    const { name, course, score, semester, status } = validatedData

    const [result] = await pool.query(
      'INSERT INTO students (name, course, score, semester, status) VALUES (?, ?, ?, ?, ?)',
      [name, course, score, semester, status]
    )

    const [newStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId])
    console.log('✅ Student created:', newStudent[0])
    res.status(201).json(newStudent[0])
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors })
    }
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

    // Merge existing data with updates to validate full object
    const merged = {
      name: req.body.name ?? existing[0].name,
      course: req.body.course ?? existing[0].course,
      score: req.body.score ?? existing[0].score,
      semester: req.body.semester ?? existing[0].semester,
      status: req.body.status ?? existing[0].status
    }

    const validatedData = studentSchema.parse(merged)

    await pool.query(
      'UPDATE students SET name = ?, course = ?, score = ?, semester = ?, status = ? WHERE id = ?',
      [validatedData.name, validatedData.course, validatedData.score, validatedData.semester, validatedData.status, id]
    )

    const [updatedStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    console.log('✅ Student updated:', updatedStudent[0])
    res.json(updatedStudent[0])
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors })
    }
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

async function getSystemContext() {
  try {
    const [students] = await pool.query('SELECT * FROM students')
    const total = students.length
    const active = students.filter((s) => s.status === 'Active').length
    const courses = [...new Set(students.map((s) => s.course))].join(', ')

    // Calculate average score
    const avgScore = total > 0
      ? (students.reduce((sum, s) => sum + (s.score || 0), 0) / total).toFixed(1)
      : 0

    const labInfo = `
Lab Descriptions:
- Lab 1 (基础组件): Introduction to Vue 3 components, reactive state, event handling. Components: HelloVue, ClickCounter, TodoApp.
- Lab 2 (API 数据交互): RESTful API interaction using Axios. Implements CRUD operations for student data.
- Lab 3 (ECharts 数据可视化): Interactive charts using ECharts library to visualize student data analysis.
- Lab 4 (G2 高级图表): Advanced data visualization using AntV G2. Professional grade charts.
- Lab 5 (学生关系网络): Student relationship network visualization using AntV G6. Shows connections by semester and course.
- Lab 6 (G6 交互可视化): Advanced G6 graph interactions. Features: Force/Grid/Radial layouts, node selection, neighbor highlighting, zoom controls.
`

    return `
Current System Data:
- Total Students: ${total}
- Active Students: ${active}
- Average Score: ${avgScore}
- Courses Offered: ${courses}
${labInfo}
- Student Data (ID: Name | Course | Semester | Score | Status):
${students.map((s) => `  ${s.id}: ${s.name} | ${s.course} | ${s.semester} | ${s.score} | ${s.status}`).join('\n')}
`.trim()
  } catch (e) {
    console.error('Error loading context:', e)
    return 'Error loading system data.'
  }
}

app.post('/api/chatbot', async (req, res) => {
  const { message, history } = req.body
  if (!message) return res.status(400).json({ ok: false, error: 'Message is required' })

  if (process.env.MOCK_GROQ === '1') {
    return res.json({ ok: true, response: `Mock reply: "${message}"`, raw: { mocked: true } })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
    return res.status(500).json({
      ok: false,
      error: 'Server misconfiguration',
      detail: 'Set a valid GROQ_API_KEY in server/.env',
    })
  }

  try {
    const systemContext = await getSystemContext()

    const messages = [
      {
        role: 'system',
        content: `You are an intelligent data analyst assistant for a student management system. 
You have access to the current database state below. 
Use this data to answer user questions accurately. 
If asked about data you don't have, say so.
Keep answers concise and helpful.

${systemContext}`
      }
    ]

    // Append history if provided (limit to last 10 turns to save tokens)
    if (Array.isArray(history)) {
      messages.push(...history.slice(-10))
    }

    // Append current user message
    messages.push({ role: 'user', content: message })

    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'qwen/qwen3-32b',
        messages: messages,
        temperature: 0.5,
        max_completion_tokens: 1024,
        top_p: 0.9,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    )

    const data = resp.data
    let text = data?.choices?.[0]?.message?.content ?? JSON.stringify(data)

    // Remove <think>...</think> blocks from the response
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    res.json({ ok: true, response: text, raw: data })
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      return res.status(502).json({
        ok: false,
        error: 'DNS resolution failed',
        detail: 'Could not resolve api.groq.com. Check network/DNS settings.',
      })
    }
    const status = err?.response?.status || 500
    const detail =
      err?.response?.data?.error?.message || err?.response?.data || err.message
    console.error('Groq API error:', detail)
    res.status(status).json({ ok: false, error: 'Groq API error', detail })
  }
})

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
})
