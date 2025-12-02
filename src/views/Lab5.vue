<template>
  <section class="lab-page">
    <!-- Page Header -->
    <LabHeader
      lab-number="05"
      title="学生关系网络"
      description="使用 G6 图可视化库构建学生关系网络，探索同学期和同课程的关联"
    >
      <template #action>
        <div class="header-actions">
          <button class="btn-export" @click="exportGraph" title="导出图片">
            <span>📥</span> 导出
          </button>
          <button class="btn-refresh" @click="reload" :disabled="loading">
            <span class="btn-icon">{{ loading ? '⏳' : '🔄' }}</span>
            {{ loading ? '加载中...' : '刷新数据' }}
          </button>
        </div>
      </template>
    </LabHeader>

    <!-- Toolbar -->
    <div class="toolbar">
      <!-- Legend -->
      <div class="legend-group">
        <span class="legend-title">图例</span>
        <div class="legend-items">
          <span class="legend-item"><span class="dot active"></span>Active</span>
          <span class="legend-item"><span class="dot inactive"></span>Inactive</span>
          <span class="legend-item"><span class="line semester"></span>同学期</span>
          <span class="legend-item"><span class="line course"></span>同课程</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-group">
        <span class="filter-title">筛选</span>
        <div class="filter-items">
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showSemester" />
            <span class="checkmark"></span>
            同学期
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showCourse" />
            <span class="checkmark"></span>
            同课程
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showActiveOnly" />
            <span class="checkmark"></span>
            仅 Active
          </label>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-group" v-if="stats.totalNodes > 0">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalNodes }}</span>
          <span class="stat-label">节点</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalEdges }}</span>
          <span class="stat-label">关系</span>
        </div>
      </div>

      <!-- Search -->
      <div class="search-group">
        <input
          v-model="searchQuery"
          @keyup.enter="searchStudent"
          placeholder="搜索学生..."
          class="search-input"
        />
        <button @click="searchStudent" class="search-btn" title="搜索">🔍</button>
        <button v-if="highlightedId" @click="clearSearch" class="clear-btn" title="清除">✕</button>
      </div>
    </div>

    <!-- Add Student Form -->
    <div class="add-form-card">
      <div class="form-header">
        <span class="form-icon">➕</span>
        <h3>添加学生</h3>
      </div>
      <form @submit.prevent="addStudent">
        <div class="form-grid">
          <div class="form-field">
            <label>姓名</label>
            <input v-model="newStudent.name" placeholder="输入姓名" required />
          </div>
          <div class="form-field">
            <label>课程</label>
            <input v-model="newStudent.course" placeholder="输入课程" required />
          </div>
          <div class="form-field">
            <label>学期</label>
            <input v-model="newStudent.semester" placeholder="e.g. Spring 2025" required />
          </div>
          <div class="form-field">
            <label>分数</label>
            <input v-model.number="newStudent.score" type="number" placeholder="0-100" min="0" max="100" required />
          </div>
          <div class="form-field">
            <label>状态</label>
            <select v-model="newStudent.status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="form-field form-action">
            <button type="submit" class="btn-submit" :disabled="adding">
              {{ adding ? '提交中...' : '添加学生' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Graph Container -->
    <div class="graph-container">
      <div ref="graphEl" class="graph"></div>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { Graph } from '@antv/g6'
import LabHeader from '../components/ui/LabHeader.vue'

const graphEl = ref(null)
let graph = null
const loading = ref(false)
const adding = ref(false)
const error = ref('')
const stats = ref({ totalNodes: 0, totalEdges: 0 })
const isDark = ref(document.documentElement.classList.contains('dark'))

// Search functionality
const searchQuery = ref('')
const highlightedId = ref(null)
const allStudents = ref([])

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
    data: {
      name: s.name,
      course: s.course,
      semester: s.semester,
      status: s.status,
      score: s.score ?? 70
    }
  }))

  const edges = []
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const a = students[i],
        b = students[j]
      if (showSemester.value && a.semester === b.semester) {
        edges.push({
          id: `edge-sem-${a.id}-${b.id}`,
          source: String(a.id),
          target: String(b.id),
          data: { relation: '同学期' }
        })
      }
      if (showCourse.value && a.course === b.course) {
        edges.push({
          id: `edge-crs-${a.id}-${b.id}`,
          source: String(a.id),
          target: String(b.id),
          data: { relation: '同课程' }
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
    allStudents.value = students
    await renderGraph(students)
  } catch (e) {
    error.value = '数据加载失败：' + (e?.message || e)
  } finally {
    loading.value = false
  }
}

// Search student by name
function searchStudent() {
  if (!searchQuery.value.trim()) return
  const query = searchQuery.value.toLowerCase()
  const found = allStudents.value.find(s => 
    s.name.toLowerCase().includes(query)
  )
  if (found) {
    highlightedId.value = String(found.id)
    highlightNode(String(found.id))
    error.value = ''
  } else {
    error.value = `未找到匹配 "${searchQuery.value}" 的学生`
  }
}

// Clear search highlight
function clearSearch() {
  highlightedId.value = null
  searchQuery.value = ''
  if (graph) {
    graph.setData(buildGraphData(allStudents.value))
    graph.render()
  }
}

// Highlight a specific node
function highlightNode(nodeId) {
  if (!graph) return
  const { nodes, edges } = buildGraphData(allStudents.value)
  
  // Find connected nodes
  const connectedIds = new Set([nodeId])
  edges.forEach(e => {
    if (e.source === nodeId) connectedIds.add(e.target)
    if (e.target === nodeId) connectedIds.add(e.source)
  })

  // Update node styles
  nodes.forEach(node => {
    const isHighlighted = connectedIds.has(node.id)
    node.style = {
      opacity: isHighlighted ? 1 : 0.2,
      lineWidth: node.id === nodeId ? 4 : 2,
    }
  })

  edges.forEach(edge => {
    const isConnected = edge.source === nodeId || edge.target === nodeId
    edge.style = {
      opacity: isConnected ? 1 : 0.1,
      lineWidth: isConnected ? 3 : 1,
    }
  })

  graph.setData({ nodes, edges })
  graph.render()
}

// Export graph as PNG
function exportGraph() {
  if (!graph) return
  try {
    graph.toDataURL('image/png', (dataURL) => {
      const link = document.createElement('a')
      link.download = 'student-network.png'
      link.href = dataURL
      link.click()
    })
  } catch (e) {
    // Fallback: use canvas directly
    const canvas = graphEl.value?.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'student-network.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
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

  const textColor = isDark.value ? '#e5e7eb' : '#374151'
  const bgColor = isDark.value ? '#1f2937' : '#ffffff'

  try {
    graph = new Graph({
      container,
      width: container.clientWidth || 800,
      height: 650,
      autoFit: 'view',
      padding: 60,
      layout: {
        type: 'circular',
        radius: Math.min(container.clientWidth, 650) / 3,
      },
      node: {
        type: 'circle',
        style: {
          size: 32,
          fill: (d) => d.data?.status === 'Active' ? '#22c55e' : '#ef4444',
          stroke: '#fff',
          lineWidth: 2,
          cursor: 'pointer',
          shadowColor: 'rgba(0,0,0,0.15)',
          shadowBlur: 6,
          labelText: (d) => d.data?.name || '',
          labelFill: textColor,
          labelFontSize: 12,
          labelFontWeight: 600,
          labelPlacement: 'bottom',
          labelOffsetY: 6,
        },
      },
      edge: {
        type: 'line',
        style: {
          stroke: (d) => d.data?.relation === '同学期' ? '#3b82f6' : '#22c55e',
          lineWidth: 1.5,
          opacity: 0.5,
          endArrow: false,
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    })

    await graph.setData({ nodes, edges })
    await graph.render()

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
    graph.setSize?.(graphEl.value.clientWidth, 650)
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
.lab-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-export:hover {
  background: var(--bg-subtle);
  border-color: var(--primary);
  color: var(--primary);
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Toolbar */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.legend-group,
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-title,
.filter-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend-items,
.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.active { background: #22c55e; }
.dot.inactive { background: #ef4444; }

.line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.line.semester { background: #3b82f6; }
.line.course { background: #22c55e; }

/* Filter Checkboxes */
.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  color: var(--text);
}

.filter-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

/* Stats */
.stats-group {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Search Group */
.search-group {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.search-input {
  padding: 0.5rem 0.75rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--text);
  width: 160px;
  transition: all var(--transition);
}

.search-input::placeholder {
  color: var(--muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.search-btn,
.clear-btn {
  padding: 0.5rem 0.625rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.search-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary);
}

.clear-btn {
  background: var(--danger-50, #fee2e2);
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
}

.clear-btn:hover {
  background: var(--danger, #ef4444);
  color: white;
}

/* Add Form Card */
.add-form-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-icon {
  font-size: 1.25rem;
}

.form-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-field input,
.form-field select {
  padding: 0.625rem 0.875rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.9rem;
  color: var(--text);
  transition: all var(--transition);
}

.form-field input::placeholder {
  color: var(--muted);
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.form-action {
  justify-content: flex-end;
}

.btn-submit {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition);
  margin-top: auto;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Graph Container */
.graph-container {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.graph {
  width: 100%;
  min-height: 650px;
  background: var(--panel);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--danger-50, #fef2f2);
  border: 1px solid var(--danger, #ef4444);
  border-radius: var(--radius);
  color: var(--danger, #ef4444);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-group {
    margin-left: 0;
    justify-content: center;
  }
}
</style>
