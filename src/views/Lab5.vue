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

    <div ref="graphEl" class="graph"></div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import * as G6 from '@antv/g6'


const graphEl = ref(null)
let graph = null
const loading = ref(false)
const error = ref('')

// track dark/light theme
const isDark = ref(document.documentElement.classList.contains('dark'))

function nodeColor(status) {
  return status === 'Active' ? '#42b883' : '#f87171'
}

function edgeColor() {
  return isDark.value ? '#475569' : '#cbd5e1'
}

function buildGraphData(students) {
  const nodes = students.map(s => ({
    id: String(s.id),
    label: `${s.name}\n${s.course}\n${s.semester}`,
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
        textAlign: 'center',
      },
      position: 'center',
    },
    size: Math.max(30, Math.min(56, 24 + (s.score ?? 70) / 3)),
  }))

  const edges = []
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const a = students[i], b = students[j]
      if (a.semester === b.semester) {
        edges.push({
          source: String(a.id),
          target: String(b.id),
          style: { stroke: edgeColor(), lineWidth: 2, opacity: 0.85 },
        })
      } else if (a.course === b.course) {
        edges.push({
          source: String(a.id),
          target: String(b.id),
          style: { stroke: edgeColor(), lineWidth: 1, opacity: 0.35 },
        })
      }
    }
  }

  return { nodes, edges }
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/students')
    const students = Array.isArray(res.data) ? res.data : []
    renderGraph(students)
  } catch (e) {
    error.value = '数据加载失败：' + (e?.message || e)
  } finally {
    loading.value = false
  }
}

async function renderGraph(students) {
  const data = buildGraphData(students)

  if (graph) {
    try { graph.destroy() } catch {}
    graph = null
  }

  const container = graphEl.value
  if (!container) return

  try {
    const { Graph } = await import('@antv/g6')

    graph = new Graph({
      container,
      width: container.clientWidth || 800,
      height: 450,
      autoFit: 'view',
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeStrength: 30,
        linkDistance: 140,
        collideStrength: 0.8,
      },
      node: {
        type: 'circle',
        style: {
          stroke: '#fff',
          lineWidth: 2,
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 10,
          cursor: 'pointer',
        },
        // ✅ show student name + course inside node
        label: {
          fields: ['name', 'course'],
          formatter: (d) => `${d.name}\n${d.course}`,
          style: {
            fill: '#fff',
            fontSize: 10,
            fontWeight: 600,
            textAlign: 'center',
          },
        },
      },
      edge: {
        type: 'line',
        style: {
          stroke: isDark.value ? '#64748b' : '#cbd5e1',
          lineWidth: 1.5,
          opacity: 0.8,
        },
        // ✅ Show relationship type on edge hover
        label: {
          fields: ['relation'],
          formatter: (d) => d.relation || '',
          style: {
            fill: '#666',
            fontSize: 9,
            background: '#fff',
          },
        },
      },
      background: isDark.value ? '#0b1220' : '#ffffff',
    })

    // ✅ Modify data to include readable node info
    const formattedData = {
      nodes: students.map(s => ({
        id: String(s.id),
        name: s.name,
        course: s.course,
        semester: s.semester,
        status: s.status,
        style: { fill: s.status === 'Active' ? '#42b883' : '#f87171' },
      })),
      edges: (() => {
        const list = []
        for (let i = 0; i < students.length; i++) {
          for (let j = i + 1; j < students.length; j++) {
            const a = students[i], b = students[j]
            if (a.semester === b.semester) {
              list.push({
                source: String(a.id),
                target: String(b.id),
                relation: `${a.semester}`,
                style: { stroke: '#60a5fa', lineWidth: 2 },
              })
            } else if (a.course === b.course) {
              list.push({
                source: String(a.id),
                target: String(b.id),
                relation: `${a.course}`,
                style: { stroke: '#a3e635', lineWidth: 1.2 },
              })
            }
          }
        }
        return list
      })()
    }

    // ✅ Feed data and render
    await graph.setData(formattedData)
    await graph.render()
    await graph.fitView()

    // ✅ Hover highlight
    graph.on('node:mouseenter', (evt) => {
      graph.updateNodeData([{ id: evt.item.id, style: { fill: '#10b981' } }])
    })
    graph.on('node:mouseleave', (evt) => {
      const s = students.find(stu => String(stu.id) === evt.item.id)
      graph.updateNodeData([{ id: evt.item.id, style: { fill: s.status === 'Active' ? '#42b883' : '#f87171' } }])
    })

    console.log('📊 图数据可视化 数据:', formattedData)
  } catch (err) {
    console.error('G6 渲染失败:', err)
    error.value = '数据加载失败：' + err.message
  }
}

const themeObserver = new MutationObserver(() => {
  const nowDark = document.documentElement.classList.contains('dark')
  if (nowDark !== isDark.value) {
    isDark.value = nowDark
    reload()
  }
})

onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  reload()
  const onResize = () => {
    if (!graph || !graphEl.value) return
    const w = graphEl.value.clientWidth
    const h = Math.max(420, graphEl.value.clientHeight || 420)

    if (typeof graph.changeSize === 'function') {
      graph.changeSize(w, h)
    } else if (typeof graph.setSize === 'function') {
      graph.setSize(w, h)
    } else if (graph.get && typeof graph.get === 'function') {
      // try canvas resize (best-effort)
      const canvas = graph.get('canvas')
      if (canvas && typeof canvas.set === 'function') {
        try { canvas.set('width', w); canvas.set('height', h) } catch {}
      } else if (typeof graph.render === 'function') {
        graph.render()
      }
    } else if (typeof graph.render === 'function') {
      graph.render()
    }
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

.graph {
  width: 100%;
  min-height: 460px;
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
