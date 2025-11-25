<template>
  <section class="lab6">
    <header class="top">
      <h2>🧪 Lab 6 — G6 交互可视化</h2>
      <div class="controls">
        <!-- 🧭 多种可视化类型 -->
        <label>
          视图：
          <select v-model="viewMode" @change="renderGraph">
            <option value="relation">关系网络（Force）</option>
            <option value="courseCluster">按课程聚类（Grid）</option>
            <option value="semesterRadial">学期分布（Radial）</option>
          </select>
        </label>

        <!-- 过滤选项（模仿 Lab5） -->
        <label>
          <input type="checkbox" v-model="showSemester" />
          显示同学期
        </label>
        <label>
          <input type="checkbox" v-model="showCourse" />
          显示同课程
        </label>
        <label>
          <input type="checkbox" v-model="showActiveOnly" />
          只看 Active 学生
        </label>

        <input
          v-model="searchName"
          @keyup.enter="focusByName"
          placeholder="按姓名搜索并高亮"
        />

        <!-- 缩放按钮 -->
        <div class="zoom-buttons">
          <button type="button" @click="zoomIn">➕ 放大</button>
          <button type="button" @click="zoomOut">➖ 缩小</button>
          <button type="button" @click="resetZoom">🧭 适应视图</button>
        </div>

        <button @click="reload" :disabled="loading">
          {{ loading ? '加载中…' : '🔄 重新加载数据' }}
        </button>
      </div>

      <!-- 图例：说明圆圈和连线含义 -->
      <div class="legend">
        <span>🟢 圆圈：Active 学生</span>
        <span>🔴 圆圈：Inactive 学生</span>
        <span>⭕ 大小：分数越高，节点越大</span>
        <span>🟦 蓝色线：同学期（Semester）关系</span>
        <span>🟩 绿色线：同课程（Course）关系</span>
      </div>
    </header>

    <div class="content">
      <!-- 左侧：图 -->
      <div ref="graphEl" class="graph"></div>

      <!-- 右侧：详情面板 -->
      <aside class="panel">
        <h3>🎯 当前选中学生</h3>
        <div v-if="selectedStudent">
          <p><strong>姓名：</strong>{{ selectedStudent.name }}</p>
          <p><strong>课程：</strong>{{ selectedStudent.course }}</p>
          <p><strong>学期：</strong>{{ selectedStudent.semester }}</p>
          <p><strong>分数：</strong>{{ selectedStudent.score }}</p>
          <p>
            <strong>状态：</strong>
            <span
              :class="[
                'tag',
                selectedStudent.status === 'Active' ? 'tag-active' : 'tag-inactive',
              ]"
            >
              {{ selectedStudent.status }}
            </span>
          </p>

          <div v-if="neighborStudents.length" class="neighbors">
            <h4>🔗 相关学生 ({{ neighborStudents.length }})</h4>
            <ul>
              <li v-for="n in neighborStudents" :key="n.id">
                {{ n.name }} — {{ n.course }} — {{ n.semester }}
              </li>
            </ul>
          </div>
        </div>
        <p v-else class="hint">
          提示：点击左侧图中的节点查看学生详情，并高亮相关节点。
        </p>

        <div class="stats" v-if="stats.totalNodes > 0">
          <p>👥 学生数：<strong>{{ stats.totalNodes }}</strong></p>
          <p>🔗 关系数：<strong>{{ stats.totalEdges }}</strong></p>
        </div>
      </aside>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
    label: s.name,
    style: {
      fill: nodeColor(s.status),
      stroke: '#ffffff',
      lineWidth: 1.5,
    },
    labelCfg: {
      style: {
        fill: '#ffffff',
        fontSize: 11,
        fontWeight: 600,
      },
      position: 'center',
    },
    size: Math.max(30, Math.min(56, 24 + (s.score ?? 70) / 3)),
    semester: s.semester,
    course: s.course,
  }))

  const edges = []
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const sameSemester = a.semester === b.semester
      const sameCourse = a.course === b.course

      if (viewMode.value === 'relation') {
        // 同学期 + 同课程，受过滤开关控制
        if (sameSemester && showSemester.value) {
          edges.push({
            source: String(a.id),
            target: String(b.id),
            relation: '同学期',
            style: { stroke: '#3b82f6' }, // 蓝色
          })
        }
        if (sameCourse && showCourse.value) {
          edges.push({
            source: String(a.id),
            target: String(b.id),
            relation: '同课程',
            style: { stroke: '#22c55e' }, // 绿色
          })
        }
      } else if (viewMode.value === 'courseCluster') {
        // 只看同课程
        if (sameCourse && showCourse.value) {
          edges.push({
            source: String(a.id),
            target: String(b.id),
            relation: '同课程',
            style: { stroke: '#22c55e' },
          })
        }
      } else if (viewMode.value === 'semesterRadial') {
        // 只看同学期
        if (sameSemester && showSemester.value) {
          edges.push({
            source: String(a.id),
            target: String(b.id),
            relation: '同学期',
            style: { stroke: '#3b82f6' },
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
    return { type: 'force', preventOverlap: true }
  }
  if (viewMode.value === 'courseCluster') {
    return { type: 'grid', preventOverlap: true }
  }
  if (viewMode.value === 'semesterRadial') {
    return { type: 'radial', preventOverlap: true }
  }
  return { type: 'force', preventOverlap: true }
}

function initGraph() {
  const container = graphEl.value
  if (!container) return

  if (graph) {
    try {
      graph.destroy()
    } catch (e) {}
    graph = null
  }

  graph = new Graph({
    container,
    width: container.clientWidth,
    height: Math.max(420, container.clientHeight || 420),
    layout: getLayoutConfig(),
    modes: {
      default: ['drag-node', 'zoom-canvas', 'drag-canvas'],
    },
    defaultNode: {
      type: 'circle',
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: '#94a3b8',
        lineWidth: 1,
      },
    },
  })

  graph.on('node:click', (evt) => {
    const model = evt.item?.getModel()
    if (!model?.id) return
    handleSelect(String(model.id))
  })

  window.addEventListener('resize', handleResize)
}

function renderGraph() {
  const container = graphEl.value
  if (!container) return

  if (!graph) {
    initGraph()
  }
  if (!graph) return

  const data = buildGraphData()

  // ✅ G6 v5 API
  graph.setData(data)
  graph.setLayout(getLayoutConfig())
  graph.render()
  graph.fitView()

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
  const { edges } = lastGraphData.value

  const neighborSet = new Set()
  edges.forEach((e) => {
    if (e.source === id) neighborSet.add(e.target)
    if (e.target === id) neighborSet.add(e.source)
  })

  graph.getNodes().forEach((node) => {
    const model = node.getModel()
    const isMain = model.id === id
    const isNeighbor = neighborSet.has(model.id)
    graph.updateItem(node, {
      style: {
        opacity: isMain || isNeighbor ? 1 : 0.2,
      },
    })
  })

  graph.getEdges().forEach((edge) => {
    const m = edge.getModel()
    const involved =
      m.source === id ||
      m.target === id ||
      (neighborSet.has(m.source) && neighborSet.has(m.target))
    graph.updateItem(edge, {
      style: {
        opacity: involved ? 0.9 : 0.15,
        lineWidth: involved ? 2 : 1,
      },
    })
  })
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
  graph.zoom(1.2) // 放大 20%
}

function zoomOut() {
  if (!graph) return
  graph.zoom(0.8) // 缩小 20%
}

function resetZoom() {
  if (!graph) return
  graph.fitView()
}

function handleResize() {
  if (!graph || !graphEl.value) return
  graph.changeSize(
    graphEl.value.clientWidth,
    Math.max(420, graphEl.value.clientHeight || 420),
  )
}

onMounted(() => {
  reload()
})

onBeforeUnmount(() => {
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
.lab6 {
  background: var(--color-card, #fff);
  color: var(--color-text, #1f2937);
  border-radius: 16px;
  box-shadow: var(--shadow, 0 8px 24px rgba(0, 0, 0, 0.08));
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.top {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.controls select,
.controls input {
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.zoom-buttons {
  display: flex;
  gap: 0.25rem;
}

.controls button {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
}

.controls button:disabled {
  opacity: 0.6;
  cursor: default;
}

.controls button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

/* 图例区域 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4b5563;
}

.legend span {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}

.content {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.graph {
  width: 100%;
  min-height: 480px;
  background: var(--color-surface, #fff);
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.panel {
  background: var(--color-surface, #f9fafb);
  border-radius: 12px;
  padding: 0.9rem;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.92rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.tag-active {
  background: #dcfce7;
  color: #16a34a;
}

.tag-inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.neighbors {
  margin-top: 0.5rem;
}

.neighbors ul {
  padding-left: 1rem;
}

.stats {
  margin-top: 0.5rem;
  font-weight: 600;
}

.hint {
  color: #6b7280;
}

.error {
  margin-top: 0.5rem;
  color: #ef4444;
  font-weight: 600;
}
</style>
