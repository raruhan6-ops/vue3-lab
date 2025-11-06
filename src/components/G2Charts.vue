<template>
  <section class="g2-demo">
    <h2>🧠 高级交互图表（G2 Visualization）</h2>

    <div class="controls">
      <button @click="loadData" :disabled="loading">
        {{ loading ? '加载中...' : '🔄 刷新数据' }}
      </button>

      <select v-model="chartType">
        <option value="overview">课程平均分（柱状图）</option>
        <option value="trend">平均成绩趋势（折线图）</option>
        <option value="status">学生状态分布（饼图）</option>
        <option value="participation">课程参与度（雷达图）</option>
        <option value="semester">学期分布（面积图）</option>
        <option value="heatmap">成绩热图（课程 × 学期）</option>
      </select>

      <span v-if="error" class="error">{{ error }}</span>
    </div>

    <div ref="chartContainer" class="chart-container"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { Chart } from '@antv/g2'

const chartContainer = ref(null)
let chart = null

const loading = ref(false)
const error = ref('')
const chartType = ref('overview')
let statsData = null

// Load data from in-memory backend
async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/stats')
    statsData = res.data
    renderChart()
  } catch (err) {
    error.value = '加载失败: ' + err.message
  } finally {
    loading.value = false
  }
}

// Render the selected chart
function renderChart() {
  if (!statsData) return
  if (chart) chart.destroy()

  chart = new Chart({
    container: chartContainer.value,
    autoFit: true,
    height: 420,
  })

  switch (chartType.value) {
    case 'overview':
      chart.options({
        type: 'interval',
        data: statsData.scoresByCourse,
        encode: { x: 'course', y: 'avg', color: 'course' },
        style: { radiusTopLeft: 5, radiusTopRight: 5 },
        animate: { enter: { type: 'waveIn' } },
        scale: { y: { domainMin: 0 } },
        axis: { x: { title: '课程' }, y: { title: '平均分' } },
        legend: { color: { position: 'top' } },
      })
      break

    case 'trend':
      chart.options({
        type: 'line',
        data: statsData.avgTrend,
        encode: { x: 'month', y: 'avg' },
        style: { stroke: '#42b883', lineWidth: 3 },
        tooltip: { title: 'month', items: [{ channel: 'y', name: '平均成绩' }] },
        scale: { y: { domainMin: 60, domainMax: 100 } },
        axis: { x: { title: '月份' }, y: { title: '平均成绩' } },
      })
      break

    case 'status':
      chart.options({
        type: 'interval',
        coordinate: { type: 'theta', innerRadius: 0.6 },
        data: statsData.statusDist,
        encode: { y: 'value', color: 'name' },
        style: { stroke: '#fff', lineWidth: 2 },
        transform: [{ type: 'stackY' }],
        legend: { color: { position: 'right' } },
        tooltip: { title: 'name', items: [{ channel: 'y', name: '人数' }] },
      })
      break

    case 'participation':
      chart.options({
        type: 'line',
        coordinate: { type: 'polar' },
        data: statsData.courseParticipation,
        encode: { x: 'course', y: 'count' },
        style: { stroke: '#1abc9c', lineWidth: 2 },
        point: { shape: 'circle', size: 5, color: '#16a085' },
        axis: { x: { title: '课程' }, y: { title: '人数' } },
      })
      break

    case 'semester':
      chart.options({
        type: 'area',
        data: statsData.semesterDistribution,
        encode: { x: 'semester', y: 'count' },
        style: {
          fill: 'l(90) 0:#42b883 1:#2ecc71',
          fillOpacity: 0.6,
        },
        scale: { y: { domainMin: 0 } },
        axis: { x: { title: '学期' }, y: { title: '人数' } },
      })
      break

    case 'heatmap':
      // create pseudo grid data
      const heatData = []
      for (const course of statsData.scoresByCourse) {
        for (const sem of statsData.semesterDistribution) {
          heatData.push({
            course: course.course,
            semester: sem.semester,
            score: Math.floor(Math.random() * 40) + 60,
          })
        }
      }
      chart.options({
        type: 'rect',
        data: heatData,
        encode: { x: 'course', y: 'semester', color: 'score' },
        scale: {
          color: {
            type: 'linear',
            domain: [60, 100],
            range: ['#e0f7fa', '#00695c'],
          },
        },
        style: { inset: 1 },
        tooltip: { title: '课程', items: [{ channel: 'color', name: '分数' }] },
      })
      break
  }

  chart.render()
}

watch(chartType, renderChart)
onMounted(loadData)
</script>

<style scoped>
.g2-demo {
  background: linear-gradient(180deg, #f9fdfb, #eef9f3);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

button {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
button:hover {
  transform: scale(1.05);
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.error {
  color: #e74c3c;
  font-weight: bold;
}

.chart-container {
  width: 100%;
  height: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  padding: 1rem;
}
</style>
