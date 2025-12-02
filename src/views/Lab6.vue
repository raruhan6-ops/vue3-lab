<template>
  <section class="lab-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="header-content">
        <span class="lab-badge">Lab 06</span>
        <h1>G6 交互可视化</h1>
        <p>高级图形交互功能：多种布局、节点选择、邻居高亮、缩放控制</p>
      </div>
      <button class="btn-refresh" @click="reload" :disabled="loading">
        <span class="btn-icon">{{ loading ? '⏳' : '🔄' }}</span>
        {{ loading ? '加载中…' : '刷新数据' }}
      </button>
    </header>

    <!-- Toolbar -->
    <div class="toolbar">
      <!-- View Mode -->
      <div class="control-group">
        <label class="control-label">视图模式</label>
        <select v-model="viewMode" @change="renderGraph" class="select-control">
          <option value="relation">关系网络（Force）</option>
          <option value="courseCluster">课程聚类（Grid）</option>
          <option value="semesterRadial">学期分布（Radial）</option>
        </select>
      </div>

      <!-- Filters -->
      <div class="control-group">
        <label class="control-label">筛选选项</label>
        <div class="checkbox-group">
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showSemester" />
            同学期
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showCourse" />
            同课程
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="showActiveOnly" />
            仅 Active
          </label>
        </div>
      </div>

      <!-- Search -->
      <div class="control-group">
        <label class="control-label">搜索学生</label>
        <div class="search-box">
          <input
            v-model="searchName"
            @keyup.enter="focusByName"
            placeholder="输入姓名搜索"
            class="search-input"
          />
          <button @click="focusByName" class="search-btn">🔍</button>
        </div>
      </div>

      <!-- Zoom Controls -->
      <div class="control-group">
        <label class="control-label">视图控制</label>
        <div class="zoom-controls">
          <button type="button" @click="zoomIn" class="zoom-btn" title="放大">➕</button>
          <button type="button" @click="zoomOut" class="zoom-btn" title="缩小">➖</button>
          <button type="button" @click="resetZoom" class="zoom-btn" title="适应视图">🧭</button>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend-bar">
      <span class="legend-item"><span class="dot active"></span>Active 学生</span>
      <span class="legend-item"><span class="dot inactive"></span>Inactive 学生</span>
      <span class="legend-item"><span class="size-indicator"></span>大小 = 分数</span>
      <span class="legend-item"><span class="line blue"></span>同学期关系</span>
      <span class="legend-item"><span class="line green"></span>同课程关系</span>
    </div>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Graph -->
      <div class="graph-container">
        <div ref="graphEl" class="graph"></div>
      </div>

      <!-- Details Panel -->
      <aside class="detail-panel">
        <div class="panel-header">
          <span class="panel-icon">🎯</span>
          <h3>学生详情</h3>
        </div>

        <div v-if="selectedStudent" class="student-details">
          <div class="detail-item">
            <span class="detail-label">姓名</span>
            <span class="detail-value">{{ selectedStudent.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">课程</span>
            <span class="detail-value">{{ selectedStudent.course }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">学期</span>
            <span class="detail-value">{{ selectedStudent.semester }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">分数</span>
            <span class="detail-value">{{ selectedStudent.score }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span :class="['status-badge', selectedStudent.status === 'Active' ? 'active' : 'inactive']">
              {{ selectedStudent.status }}
            </span>
          </div>

          <div v-if="neighborStudents.length" class="neighbors-section">
            <h4>🔗 相关学生 ({{ neighborStudents.length }})</h4>
            <ul class="neighbors-list">
              <li v-for="n in neighborStudents" :key="n.id">
                <span class="neighbor-name">{{ n.name }}</span>
                <span class="neighbor-info">{{ n.course }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="panel-placeholder">
          <span class="placeholder-icon">👆</span>
          <p>点击图中节点查看学生详情</p>
        </div>

        <!-- Stats -->
        <div class="panel-stats" v-if="stats.totalNodes > 0">
          <div class="panel-stat">
            <span class="stat-value">{{ stats.totalNodes }}</span>
            <span class="stat-label">学生数</span>
          </div>
          <div class="panel-stat">
            <span class="stat-value">{{ stats.totalEdges }}</span>
            <span class="stat-label">关系数</span>
          </div>
        </div>
      </aside>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { Graph } from '@antv/g6'

const graphEl = ref(null)
let graph = null

const loading = ref(false)
const error = ref('')

const students = ref([])
const stats = ref({ totalNodes: 0, totalEdges: 0 })

const selectedId = ref(null)
const selectedStudent = ref(null)
const searchName = ref('')

// 多种可视化类型
// 'relation' | 'courseCluster' | 'semesterRadial'
const viewMode = ref('relation')

// 过滤选项（模仿 Lab5）
const showSemester = ref(true)
const showCourse = ref(true)
const showActiveOnly = ref(false)

// 缓存最近一次图数据，用于交互高亮和统计
const lastGraphData = ref({ nodes: [], edges: [] })

const neighborStudents = computed(() => {
  if (!selectedId.value) return []
  const neighbors = new Set()
  lastGraphData.value.edges.forEach((e) => {
    if (e.source === selectedId.value) neighbors.add(e.target)
    if (e.target === selectedId.value) neighbors.add(e.source)
  })
  return students.value.filter((s) => neighbors.has(String(s.id)))
})

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/students')
    students.value = Array.isArray(res.data) ? res.data : []
    renderGraph()
  } catch (e) {
    console.error(e)
    error.value = '数据加载失败: ' + (e?.message || e)
  } finally {
    loading.value = false
  }
}

function nodeColor(status) {
  if (status === 'Active') return '#22c55e'
  if (status === 'Inactive') return '#ef4444'
  return '#3b82f6'
}

// 根据当前 viewMode 和 过滤选项 构建图数据
function buildGraphData() {
  const listRaw = students.value || []
  const list = showActiveOnly.value
    ? listRaw.filter((s) => s.status === 'Active')
    : listRaw

  const nodes = list.map((s) => ({
    id: String(s.id),
    data: {
      name: s.name,
      course: s.course,
      semester: s.semester,
      status: s.status,
      score: s.score ?? 70,
    },
  }))

  const edges = []
  let edgeIdx = 0
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const sameSemester = a.semester === b.semester
      const sameCourse = a.course === b.course

      if (viewMode.value === 'relation') {
        if (sameSemester && showSemester.value) {
          edges.push({
            id: `edge-${edgeIdx++}`,
            source: String(a.id),
            target: String(b.id),
            data: { relation: '同学期' },
          })
        }
        if (sameCourse && showCourse.value) {
          edges.push({
            id: `edge-${edgeIdx++}`,
            source: String(a.id),
            target: String(b.id),
            data: { relation: '同课程' },
          })
        }
      } else if (viewMode.value === 'courseCluster') {
        if (sameCourse && showCourse.value) {
          edges.push({
            id: `edge-${edgeIdx++}`,
            source: String(a.id),
            target: String(b.id),
            data: { relation: '同课程' },
          })
        }
      } else if (viewMode.value === 'semesterRadial') {
        if (sameSemester && showSemester.value) {
          edges.push({
            id: `edge-${edgeIdx++}`,
            source: String(a.id),
            target: String(b.id),
            data: { relation: '同学期' },
          })
        }
      }
    }
  }

  lastGraphData.value = { nodes, edges }
  stats.value = { totalNodes: nodes.length, totalEdges: edges.length }

  return { nodes, edges }
}

// 根据 viewMode 返回不同的布局配置（G6 v5）
function getLayoutConfig() {
  if (viewMode.value === 'relation') {
    return { type: 'd3-force', preventOverlap: true, nodeSize: 60, nodeSpacing: 80 }
  }
  if (viewMode.value === 'courseCluster') {
    return { type: 'grid', preventOverlap: true, nodeSize: 60, sortBy: 'data.course' }
  }
  if (viewMode.value === 'semesterRadial') {
    return { type: 'radial', preventOverlap: true, unitRadius: 120, nodeSize: 60 }
  }
  return { type: 'd3-force', preventOverlap: true, nodeSize: 60 }
}

// Track dark mode
const isDark = ref(document.documentElement.classList.contains('dark'))

function initGraph() {
  const container = graphEl.value
  if (!container) return

  if (graph) {
    try { graph.destroy() } catch (e) {}
    graph = null
  }

  const textColor = isDark.value ? '#e5e7eb' : '#374151'
  const bgColor = isDark.value ? '#1f2937' : '#ffffff'

  graph = new Graph({
    container,
    width: container.clientWidth,
    height: Math.max(600, container.clientHeight || 600),
    autoFit: 'view',
    padding: 60,
    layout: getLayoutConfig(),
    node: {
      type: 'circle',
      style: {
        size: 30,
        fill: (d) => d.data?.status === 'Active' ? '#22c55e' : '#ef4444',
        stroke: '#fff',
        lineWidth: 2,
        cursor: 'pointer',
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowBlur: 6,
        labelText: (d) => d.data?.name || '',
        labelFill: textColor,
        labelFontSize: 12,
        labelFontWeight: 500,
        labelPlacement: 'bottom',
        labelOffsetY: 6,
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: (d) => d.data?.relation === '同学期' ? '#3b82f6' : '#22c55e',
        lineWidth: 1,
        opacity: 0.4,
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  })

  // Node click handler for G6 v5
  graph.on('node:click', (evt) => {
    const nodeId = evt.target?.id
    if (nodeId) {
      handleSelect(String(nodeId))
    }
  })

  window.addEventListener('resize', handleResize)
}

function renderGraph() {
  const container = graphEl.value
  if (!container) return

  // Always recreate graph on render to apply theme changes
  if (graph) {
    try { graph.destroy() } catch (e) {}
    graph = null
  }
  
  initGraph()
  if (!graph) return

  const data = buildGraphData()

  graph.setData(data)
  graph.render()

  if (selectedId.value) {
    highlightSelection(selectedId.value)
  }
}

function handleSelect(id) {
  selectedId.value = id
  selectedStudent.value =
    students.value.find((s) => String(s.id) === id) || null
  highlightSelection(id)
}

function highlightSelection(id) {
  if (!graph) return
  
  const { nodes, edges } = lastGraphData.value
  const neighborSet = new Set()
  
  edges.forEach((e) => {
    if (e.source === id) neighborSet.add(e.target)
    if (e.target === id) neighborSet.add(e.source)
  })

  // G6 v5: Update node and edge states
  nodes.forEach((node) => {
    const isMain = node.id === id
    const isNeighbor = neighborSet.has(node.id)
    const opacity = isMain || isNeighbor ? 1 : 0.25
    try {
      graph.updateNodeData([{ id: node.id, style: { opacity } }])
    } catch (e) {}
  })

  edges.forEach((edge) => {
    const involved = edge.source === id || edge.target === id
    const opacity = involved ? 1 : 0.15
    const lineWidth = involved ? 3 : 1
    try {
      graph.updateEdgeData([{ id: edge.id, style: { opacity, lineWidth } }])
    } catch (e) {}
  })

  graph.draw()
}

function focusByName() {
  const name = searchName.value.trim()
  if (!name) return
  const found = students.value.find((s) =>
    String(s.name).toLowerCase().includes(name.toLowerCase()),
  )
  if (!found) {
    error.value = `未找到姓名包含 “${name}” 的学生`
    return
  }
  error.value = ''
  handleSelect(String(found.id))
}

// 缩放控制（G6 v5）
function zoomIn() {
  if (!graph) return
  const currentZoom = graph.getZoom() || 1
  graph.zoomTo(currentZoom * 1.2)
}

function zoomOut() {
  if (!graph) return
  const currentZoom = graph.getZoom() || 1
  graph.zoomTo(currentZoom * 0.8)
}

function resetZoom() {
  if (!graph) return
  graph.fitView()
}

function handleResize() {
  if (!graph || !graphEl.value) return
  graph.setSize(
    graphEl.value.clientWidth,
    Math.max(600, graphEl.value.clientHeight || 600),
  )
}

// Watch for theme changes
const themeObserver = new MutationObserver(() => {
  const nowDark = document.documentElement.classList.contains('dark')
  if (nowDark !== isDark.value) {
    isDark.value = nowDark
    renderGraph()
  }
})

// Watch filter changes
watch([showSemester, showCourse, showActiveOnly, viewMode], () => {
  if (students.value.length > 0) {
    renderGraph()
  }
})

onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  reload()
})

onBeforeUnmount(() => {
  try { themeObserver.disconnect() } catch {}
  window.removeEventListener('resize', handleResize)
  if (graph) {
    try {
      graph.destroy()
    } catch (e) {}
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

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.header-content {
  max-width: 600px;
}

.lab-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.page-header p {
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
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
  align-items: flex-end;
  padding: 1rem 1.25rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.control-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-control {
  padding: 0.5rem 0.75rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  transition: all var(--transition);
}

.select-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.checkbox-group {
  display: flex;
  gap: 0.75rem;
}

.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  color: var(--text);
}

.filter-checkbox input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--primary);
  cursor: pointer;
}

.search-box {
  display: flex;
  gap: 0.25rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--text);
  width: 150px;
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

.search-btn {
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

.zoom-controls {
  display: flex;
  gap: 0.25rem;
}

.zoom-btn {
  padding: 0.5rem 0.625rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
}

.zoom-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary);
}

/* Legend Bar */
.legend-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-subtle);
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.active { background: #22c55e; }
.dot.inactive { background: #ef4444; }

.size-indicator {
  width: 12px;
  height: 12px;
  border: 2px solid var(--muted);
  border-radius: 50%;
}

.line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.line.blue { background: #3b82f6; }
.line.green { background: #22c55e; }

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  align-items: start;
}

.graph-container {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.graph {
  width: 100%;
  min-height: 600px;
  background: var(--panel);
}

/* Detail Panel */
.detail-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  position: sticky;
  top: 1rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.panel-icon {
  font-size: 1.25rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--muted);
}

.detail-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.neighbors-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.neighbors-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.neighbors-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.neighbors-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.neighbors-list li:last-child {
  border-bottom: none;
}

.neighbor-name {
  font-weight: 500;
}

.neighbor-info {
  color: var(--muted);
  font-size: 0.8rem;
}

.panel-placeholder {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted);
}

.placeholder-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.panel-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.panel-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.panel-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.panel-stat .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.panel-stat .stat-label {
  font-size: 0.7rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .checkbox-group {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
    flex: 1;
  }
}
</style>
