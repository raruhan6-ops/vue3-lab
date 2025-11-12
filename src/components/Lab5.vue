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

function renderGraph(students) {
  const data = buildGraphData(students)

  // clean previous graph
  if (graph) {
    try { graph.destroy() } catch {}
    graph = null
  }

  const container = graphEl.value
  if (!container) return

  graph = new G6.Graph({
    container,
    width: container.clientWidth,
    height: Math.max(420, container.clientHeight || 420),
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSpacing: 30,
      linkDistance: 120,
      alphaDecay: 0.02,
      collideStrength: 0.8,
    },
    modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
    defaultNode: {
      type: 'circle',
      style: {
        cursor: 'pointer',
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowBlur: 8,
      },
    },
    defaultEdge: {
      style: { lineAppendWidth: 8, endArrow: false },
    },
    nodeStateStyles: {
      hover: { stroke: '#fff', lineWidth: 2.5, shadowColor: 'rgba(0,0,0,0.35)', shadowBlur: 12 },
    },
    edgeStateStyles: {
      hover: { lineWidth: 3, opacity: 1 },
    },
    fitView: true,
    animate: true,
    background: isDark.value ? '#0b1220' : '#ffffff',
  })

  // ✅ Correct G6 v5+ syntax
  graph.read(data)



  graph.on('node:mouseenter', evt => graph.setItemState(evt.item, 'hover', true))
  graph.on('node:mouseleave', evt => graph.setItemState(evt.item, 'hover', false))
  graph.on('edge:mouseenter', evt => graph.setItemState(evt.item, 'hover', true))
  graph.on('edge:mouseleave', evt => graph.setItemState(evt.item, 'hover', false))
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
    if (graph && graphEl.value) {
      graph.setSize(graphEl.value.clientWidth, Math.max(420, graphEl.value.clientHeight || 420))
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
