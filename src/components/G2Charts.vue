<template>
  <section class="g2-demo">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title">🧠 G2 高级图表</span>
        <span class="toolbar-subtitle">交互式数据可视化</span>
      </div>
      <div class="toolbar-actions">
        <select v-model="chartType" class="chart-select">
          <option value="overview">课程平均分（柱状图）</option>
          <option value="trend">平均成绩趋势（折线图）</option>
          <option value="status">学生状态分布（饼图）</option>
          <option value="participation">课程参与度（雷达图）</option>
          <option value="semester">学期分布（面积图）</option>
          <option value="heatmap">成绩热图（课程 × 学期）</option>
        </select>
        <button @click="loadData" :disabled="loading" class="btn-refresh">
          <span>{{ loading ? '⏳' : '🔄' }}</span>
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-alert">
      <span>⚠️</span>
      <span>{{ error }}</span>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>{{ chartTitles[chartType] }}</h3>
        <span class="chart-badge">{{ chartBadges[chartType] }}</span>
      </div>
      <div ref="chartContainer" class="chart-container"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import { Chart } from '@antv/g2'

const chartContainer = ref(null)
let chart = null

const loading = ref(false)
const error = ref('')
const chartType = ref('overview')
let statsData = null

// Track dark mode
const isDark = ref(document.documentElement.classList.contains('dark'))

const chartTitles = {
  overview: '课程平均分',
  trend: '平均成绩趋势',
  status: '学生状态分布',
  participation: '课程参与度',
  semester: '学期分布',
  heatmap: '成绩热图'
}

const chartBadges = {
  overview: '柱状图',
  trend: '折线图',
  status: '饼图',
  participation: '雷达图',
  semester: '面积图',
  heatmap: '热力图'
}

// Get theme colors based on dark mode
function getThemeColors() {
  const dark = isDark.value
  return {
    textColor: dark ? '#e5e7eb' : '#374151',
    labelColor: dark ? '#9ca3af' : '#6b7280',
    gridColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    backgroundColor: dark ? '#1f2937' : '#ffffff',
    primaryColor: '#10b981',
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
  }
}

// Load data from backend
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

  const theme = getThemeColors()

  chart = new Chart({
    container: chartContainer.value,
    autoFit: true,
    height: 380,
  })

  // Use G2 built-in dark theme when dark mode is active
  if (isDark.value) {
    chart.theme({ type: 'classicDark', view: { viewFill: 'transparent' } })
  }

  switch (chartType.value) {
    case 'overview':
      chart.options({
        type: 'interval',
        data: statsData.scoresByCourse,
        encode: { x: 'course', y: 'avg', color: 'course' },
        style: { radiusTopLeft: 6, radiusTopRight: 6 },
        animate: { enter: { type: 'waveIn' } },
        scale: { y: { domainMin: 0 }, color: { range: theme.colors } },
        axis: {
          x: { title: '课程', labelFill: theme.labelColor, titleFill: theme.textColor },
          y: { title: '平均分', labelFill: theme.labelColor, titleFill: theme.textColor, grid: true }
        },
        legend: { color: { position: 'top' } },
      })
      break

    case 'trend':
      chart.options({
        type: 'line',
        data: statsData.avgTrend,
        encode: { x: 'month', y: 'avg' },
        style: { stroke: theme.primaryColor, lineWidth: 3 },
        tooltip: { title: 'month', items: [{ channel: 'y', name: '平均成绩' }] },
        scale: { y: { domainMin: 60, domainMax: 100 } },
        axis: {
          x: { title: '月份', labelFill: theme.labelColor, titleFill: theme.textColor },
          y: { title: '平均成绩', labelFill: theme.labelColor, titleFill: theme.textColor, grid: true }
        },
      })
      break

    case 'status':
      chart.options({
        type: 'interval',
        coordinate: { type: 'theta', innerRadius: 0.6 },
        data: statsData.statusDist,
        encode: { y: 'value', color: 'name' },
        style: { stroke: theme.backgroundColor, lineWidth: 2 },
        transform: [{ type: 'stackY' }],
        scale: { color: { range: [theme.primaryColor, '#ef4444'] } },
        legend: { color: { position: 'right' } },
        tooltip: { title: 'name', items: [{ channel: 'y', name: '人数' }] },
        labels: [{
          text: 'name',
          position: 'outside',
          style: { fill: theme.textColor, fontSize: 12 }
        }]
      })
      break

    case 'participation':
      chart.options({
        type: 'line',
        coordinate: { type: 'polar' },
        data: statsData.courseParticipation,
        encode: { x: 'course', y: 'count' },
        style: { stroke: theme.primaryColor, lineWidth: 2 },
        point: { shape: 'circle', size: 5, color: theme.primaryColor },
        axis: {
          x: { title: '课程', labelFill: theme.labelColor, titleFill: theme.textColor },
          y: { title: '人数', labelFill: theme.labelColor, titleFill: theme.textColor, grid: true }
        },
      })
      break

    case 'semester':
      chart.options({
        type: 'area',
        data: statsData.semesterDistribution,
        encode: { x: 'semester', y: 'count' },
        style: {
          fill: `l(90) 0:${theme.primaryColor} 1:#3b82f6`,
          fillOpacity: 0.6,
        },
        scale: { y: { domainMin: 0 } },
        axis: {
          x: { title: '学期', labelFill: theme.labelColor, titleFill: theme.textColor },
          y: { title: '人数', labelFill: theme.labelColor, titleFill: theme.textColor, grid: true }
        },
      })
      break

    case 'heatmap':
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
            range: isDark.value ? ['#064e3b', '#10b981'] : ['#d1fae5', '#059669'],
          },
        },
        style: { inset: 1 },
        axis: {
          x: { labelFill: theme.labelColor, titleFill: theme.textColor },
          y: { labelFill: theme.labelColor, titleFill: theme.textColor }
        },
        tooltip: { title: '课程', items: [{ channel: 'color', name: '分数' }] },
        labels: [{
          text: 'score',
          style: { fill: theme.textColor, fontSize: 11 }
        }]
      })
      break
  }

  chart.render()
}

// Watch for theme changes
const themeObserver = new MutationObserver(() => {
  const nowDark = document.documentElement.classList.contains('dark')
  if (nowDark !== isDark.value) {
    isDark.value = nowDark
    if (statsData) renderChart()
  }
})

watch(chartType, renderChart)

onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  loadData()
})

onBeforeUnmount(() => {
  themeObserver.disconnect()
  if (chart) chart.destroy()
})
</script>

<style scoped>
.g2-demo {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toolbar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.toolbar-subtitle {
  font-size: 0.85rem;
  color: var(--muted);
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.chart-select {
  padding: 0.625rem 1rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
  transition: all var(--transition);
}

.chart-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: var(--danger-50, #fef2f2);
  border: 1px solid var(--danger, #ef4444);
  border-radius: var(--radius);
  color: var(--danger, #ef4444);
  font-weight: 500;
  margin-bottom: 1.5rem;
}

/* Chart Card */
.chart-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition);
}

.chart-card:hover {
  box-shadow: var(--shadow-md);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
}

.chart-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.chart-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.chart-container {
  width: 100%;
  height: 380px;
  padding: 1rem;
  background: transparent;
}

/* Responsive */
@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .toolbar-actions {
    flex-direction: column;
  }
  
  .chart-select,
  .btn-refresh {
    width: 100%;
  }
}
</style>
