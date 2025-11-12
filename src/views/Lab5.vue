<template>
  <section class="lab5">
    <header class="top">
      <h2>🕸️ 学生关系可视化（Lab 5）</h2>
      <div class="controls">
        <button @click="reload" :disabled="loading">
          {{ loading ? '加载中...' : '🔄 重新生成' }}
        </button>
      </div>
    </header>

    <!-- 🧭 Legend -->
    <div class="legend">
      <span>🟢 Active</span>
      <span>🔴 Inactive</span>
      <span style="color:#3b82f6;">🔵 同学期 (Same Semester)</span>
      <span style="color:#22c55e;">🟩 同课程 (Same Course)</span>
    </div>

    <!-- 🎛️ Filters -->
    <div class="filters">
      <label><input type="checkbox" v-model="showSemester" /> 显示同学期</label>
      <label><input type="checkbox" v-model="showCourse" /> 显示同课程</label>
      <label><input type="checkbox" v-model="showActiveOnly" /> 仅显示Active学生</label>
    </div>

    <!-- 🧩 Add Student Form -->
    <form class="add-form" @submit.prevent="addStudent">
      <h3>➕ 添加学生</h3>
      <div class="form-row">
        <input v-model="newStudent.name" placeholder="姓名" required />
        <input v-model="newStudent.course" placeholder="课程" required />
        <input v-model="newStudent.semester" placeholder="学期 (e.g. Spring 2025)" required />
      </div>
      <div class="form-row">
        <input v-model.number="newStudent.score" type="number" placeholder="分数 (0-100)" min="0" max="100" required />
        <select v-model="newStudent.status">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button type="submit" :disabled="adding">{{ adding ? '提交中...' : '添加' }}</button>
      </div>
    </form>

    <!-- 📊 Stats -->
    <div class="stats" v-if="stats.totalNodes > 0">
      <p>👥 学生节点数: <strong>{{ stats.totalNodes }}</strong></p>
      <p>🔗 关系数: <strong>{{ stats.totalEdges }}</strong></p>
    </div>

    <!-- 🧠 Visualization -->
    <div ref="graphEl" class="graph"></div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { Graph } from '@antv/g6'

const graphEl = ref(null)
let graph = null
const loading = ref(false)
const adding = ref(false)
const error = ref('')
const stats = ref({ totalNodes: 0, totalEdges: 0 })
const isDark = ref(document.documentElement.classList.contains('dark'))

// Filters
const showSemester = ref(true)
const showCourse = ref(true)
const showActiveOnly = ref(false)

// Add Student model
const newStudent = ref({
  name: '',
  course: '',
  semester: '',
  score: 70,
  status: 'Active'
})

function nodeColor(status) {
  return status === 'Active' ? '#22c55e' : '#ef4444'
}

function buildGraphData(students) {
  if (showActiveOnly.value)
    students = students.filter((s) => s.status === 'Active')

  const nodes = students.map((s) => ({
    id: String(s.id),
    label: `${s.name}\n${s.course}`,
    semester: s.semester,
    style: {
      fill: nodeColor(s.status),
      stroke: '#fff',
      lineWidth: 1.4
    },
    labelCfg: {
      style: {
        fill: '#fff',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center'
      },
      position: 'center'
    },
    size: Math.max(32, Math.min(56, 24 + (s.score ?? 70) / 3))
  }))

  const edges = []
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const a = students[i],
        b = students[j]
      if (showSemester.value && a.semester === b.semester) {
        edges.push({
          source: String(a.id),
          target: String(b.id),
          relation: '同学期',
          label: '同学期'
        })
      }
      if (showCourse.value && a.course === b.course) {
        edges.push({
          source: String(a.id),
          target: String(b.id),
          relation: '同课程',
          label: '同课程'
        })
      }
    }
  }
  return { nodes, edges }
}

// Add student interactively
async function addStudent() {
  adding.value = true
  try {
    await axios.post('/api/students', newStudent.value)
    // Reset form
    newStudent.value = {
      name: '',
      course: '',
      semester: '',
      score: 70,
      status: 'Active'
    }
    await reload()
  } catch (err) {
    console.error('添加失败:', err)
    error.value = '添加失败: ' + err.message
  } finally {
    adding.value = false
  }
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/students')
    const students = Array.isArray(res.data) ? res.data : []
    await renderGraph(students)
  } catch (e) {
    error.value = '数据加载失败：' + (e?.message || e)
  } finally {
    loading.value = false
  }
}

async function renderGraph(students) {
  const { nodes, edges } = buildGraphData(students)
  if (graph) {
    try { graph.destroy() } catch {}
    graph = null
  }

  const container = graphEl.value
  if (!container) return

  try {
    graph = new Graph({
      container,
      width: container.clientWidth || 800,
      height: 520,
      autoFit: 'view',
      layout: {
        type: 'circular',
        preventOverlap: true,
        nodeSize: 50
      },
      node: {
        type: 'circle',
        style: {
          cursor: 'pointer',
          shadowColor: 'rgba(0,0,0,0.15)',
          shadowBlur: 8
        }
      },
      edge: {
        type: 'line',
        label: {
          text: (d) => d.label,
          position: 'center',
          style: {
            fill: isDark.value ? '#fff' : '#222',
            fontSize: 12,
            fontWeight: 600,
            background: {
              fill: isDark.value ? '#0b1220' : '#ffffff',
              padding: [3, 5],
              radius: 5
            }
          }
        },
        style: (d) => ({
          stroke: d.relation === '同学期' ? '#3b82f6' : '#22c55e',
          lineWidth: d.relation === '同学期' ? 2.5 : 2,
          opacity: 0.9
        })
      },
      background: isDark.value ? '#0b1220' : '#ffffff'
    })

    await graph.setData({ nodes, edges })
    await graph.render()
    await graph.fitView()

    stats.value = { totalNodes: nodes.length, totalEdges: edges.length }
  } catch (err) {
    console.error('G6 渲染失败:', err)
    error.value = '渲染失败：' + err.message
  }
}

const themeObserver = new MutationObserver(() => {
  const nowDark = document.documentElement.classList.contains('dark')
  if (nowDark !== isDark.value) {
    isDark.value = nowDark
    reload()
  }
})

watch([showSemester, showCourse, showActiveOnly], () => reload())

onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  reload()
  const onResize = () => {
    if (!graph || !graphEl.value) return
    graph.changeSize?.(graphEl.value.clientWidth, 520)
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

onBeforeUnmount(() => {
  try { themeObserver.disconnect() } catch {}
  if (graph) {
    try { graph.destroy() } catch {}
    graph = null
  }
})
</script>

<style scoped>
.lab5 {
  background: var(--color-card, #fff);
  color: var(--color-text, #1f2937);
  border-radius: 16px;
  box-shadow: var(--shadow, 0 8px 24px rgba(0,0,0,.08));
  padding: 1.25rem;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .75rem;
}
.controls button {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: .55rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
  box-shadow: 0 6px 14px rgba(66, 184, 131, .25);
}
.controls button:hover { transform: translateY(-2px); }

.legend, .filters, .add-form {
  background: var(--color-surface, #fff);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
  margin-bottom: 0.8rem;
}
.dark .legend, .dark .filters, .dark .add-form {
  background: #1e293b;
  color: #f1f5f9;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-weight: 600;
}

.add-form h3 {
  margin: 0 0 .5rem 0;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  margin-bottom: .5rem;
}
.form-row input, .form-row select {
  padding: .4rem .6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}
.form-row button {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: .45rem 1rem;
  font-weight: 600;
  cursor: pointer;
}
.form-row button:hover {
  opacity: .9;
}

.stats {
  display: flex;
  justify-content: flex-start;
  gap: 2rem;
  margin: 0.8rem 0 1rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 0.6rem 1rem;
}
.graph {
  width: 100%;
  min-height: 520px;
  background: var(--color-surface, #fff);
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.04);
  overflow: hidden;
}
.error {
  color: #ef4444;
  margin-top: .75rem;
  font-weight: 600;
}
</style>
