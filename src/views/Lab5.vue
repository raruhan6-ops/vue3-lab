<template>
  <section class="lab5">
    <h2>🕸️ 实验五：图数据可视化</h2>

    <div class="controls">
      <button @click="generateGraph" class="btn">🔄 生成随机图</button>
      <span class="info">节点数: {{ nodes.length }} | 连接数: {{ links.length }}</span>
    </div>

    <div ref="chartContainer" class="chart"></div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue"
import * as echarts from "echarts"

const chartContainer = ref(null)
let chart = null
const nodes = ref([])
const links = ref([])

function generateGraph() {
  const count = 10 + Math.floor(Math.random() * 10)
  nodes.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `节点 ${i + 1}`,
    value: Math.floor(Math.random() * 100),
    symbolSize: 20 + Math.random() * 20,
    itemStyle: { color: getRandomColor() }
  }))

  links.value = []
  for (let i = 0; i < count * 1.5; i++) {
    const src = Math.floor(Math.random() * count)
    const tgt = Math.floor(Math.random() * count)
    if (src !== tgt) links.value.push({ source: src, target: tgt })
  }

  renderChart()
}

function getRandomColor() {
  const palette = ["#42b883", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"]
  return palette[Math.floor(Math.random() * palette.length)]
}

function renderChart() {
  if (!chartContainer.value) return
  if (chart) chart.dispose()

  chart = echarts.init(chartContainer.value)
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      formatter: p => `🔹 ${p.data.name}<br>值: ${p.data.value}`
    },
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        label: { show: true, color: "#fff" },
        force: { repulsion: 120, edgeLength: 80 },
        data: nodes.value,
        links: links.value,
        lineStyle: { color: "source", width: 1.5, opacity: 0.8 }
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  generateGraph()
  window.addEventListener("resize", () => chart?.resize())
})
</script>

<style scoped>
.lab5 {
  padding: 2rem;
  animation: fadeIn 0.8s ease;
}
h2 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1.2rem;
}
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
}
.info {
  font-weight: 600;
  color: var(--color-text);
}
.chart {
  width: 100%;
  height: 500px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
