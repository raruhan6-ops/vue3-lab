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
  { id: 1, name: 'Ruhan', course: 'Vue 3 Lab', score: 95, semester: 'Spring 2025', status: 'Active' },
  { id: 2, name: 'Rejuan', course: 'Frontend Interaction', score: 90, semester: 'Fall 2024', status: 'Active' },
  { id: 3, name: 'Ahmed', course: 'Backend Basics', score: 85, semester: 'Spring 2025', status: 'Inactive' }
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

// simple stats
app.get('/api/stats', (req, res) => {
  const byCourse = Object.values(students.reduce((acc, s) => {
    if (!acc[s.course]) acc[s.course] = { course: s.course, total: 0, count: 0 }
    acc[s.course].total += (s.score || 0)
    acc[s.course].count += 1
    return acc
  }, {})).map(c => ({ course: c.course, avg: Number(c.total / c.count).toFixed(2) }))
  res.json({ scoresByCourse: byCourse })
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
