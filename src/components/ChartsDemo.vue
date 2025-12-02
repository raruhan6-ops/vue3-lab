<template>
  <section class="charts-demo">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title">📊 图表概览</span>
        <span class="toolbar-subtitle">基于 ECharts 的学生数据可视化</span>
      </div>
      <div class="toolbar-actions">
        <button @click="loadData" :disabled="loading" class="btn btn-primary">
          <span>{{ loading ? '⏳' : '🔄' }}</span>
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
        <button @click="exportCharts" class="btn btn-outline">
          <span>📤</span>
          导出图表
        </button>
      </div>
    </div>

    <div v-if="error" class="error-alert">
      <span class="error-icon">⚠️</span>
      <span>数据加载失败: {{ error }}</span>
    </div>

    <div v-if="!error" class="chart-grid">
      <div v-for="(chart, i) in chartIds" :key="i" class="chart-card">
        <div class="chart-header">
          <h3>{{ chartTitles[i] }}</h3>
          <span class="chart-badge">{{ chartTypes[i] }}</span>
        </div>
        <div :id="chart" class="chart"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import * as echarts from 'echarts'
import axios from 'axios'
import { ref, onMounted } from 'vue'

const chartIds = ['avgScore', 'participation', 'semester', 'status', 'trend']
const chartTitles = [
  '课程平均分',
  '课程参与度',
  '学期分布',
  '状态占比',
  '成绩趋势',
]
const chartTypes = ['柱状图', '柱状图', '折线图', '饼图', '折线图']

const loading = ref(false)
const error = ref('')
const charts = ref({})

// Professional color palette
const colors = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get('/api/stats')
    renderCharts(data)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function renderCharts(data) {
  destroyCharts()

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const commonAxisStyle = {
    axisLine: { lineStyle: { color: gridColor } },
    axisTick: { lineStyle: { color: gridColor } },
    axisLabel: { color: textColor },
    splitLine: { lineStyle: { color: gridColor } }
  }

  // Chart 1 - Avg Scores
  charts.value.avgScore = echarts.init(document.getElementById('avgScore'))
  charts.value.avgScore.setOption({
    color: colors.gradient,
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.scoresByCourse.map(c => c.course),
      ...commonAxisStyle
    },
    yAxis: { type: 'value', ...commonAxisStyle },
    series: [{ 
      type: 'bar', 
      data: data.scoresByCourse.map(c => c.avg),
      barWidth: '60%',
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }],
  })

  // Chart 2 - Participation
  charts.value.participation = echarts.init(document.getElementById('participation'))
  charts.value.participation.setOption({
    color: [colors.secondary],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.courseParticipation.map(c => c.course),
      ...commonAxisStyle
    },
    yAxis: { type: 'value', ...commonAxisStyle },
    series: [{ 
      type: 'bar', 
      data: data.courseParticipation.map(c => c.count),
      barWidth: '60%',
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }],
  })

  // Chart 3 - Semester Distribution
  charts.value.semester = echarts.init(document.getElementById('semester'))
  charts.value.semester.setOption({
    color: [colors.accent],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.semesterDistribution.map(s => s.semester),
      ...commonAxisStyle
    },
    yAxis: { type: 'value', ...commonAxisStyle },
    series: [{ 
      type: 'line', 
      smooth: true, 
      data: data.semesterDistribution.map(s => s.count),
      areaStyle: { opacity: 0.15 },
      symbol: 'circle',
      symbolSize: 8
    }],
  })

  // Chart 4 - Status Distribution
  charts.value.status = echarts.init(document.getElementById('status'))
  charts.value.status.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: data.statusDist.map(s => ({ value: s.value, name: s.name })),
        label: { 
          show: true, 
          formatter: '{b}\n{d}%',
          color: textColor
        },
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#1f2937' : '#fff',
          borderWidth: 2
        }
      },
    ],
    color: [colors.primary, colors.danger],
  })

  // Chart 5 - Avg Trend
  charts.value.trend = echarts.init(document.getElementById('trend'))
  charts.value.trend.setOption({
    color: [colors.secondary],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.avgTrend.map(d => d.month),
      ...commonAxisStyle
    },
    yAxis: { type: 'value', ...commonAxisStyle },
    series: [{ 
      type: 'line', 
      smooth: true, 
      data: data.avgTrend.map(d => d.avg),
      areaStyle: { opacity: 0.15 },
      symbol: 'circle',
      symbolSize: 8
    }],
  })
}

function destroyCharts() {
  Object.values(charts.value).forEach(c => c?.dispose?.())
  charts.value = {}
}

function exportCharts() {
  Object.values(charts.value).forEach((chart, idx) => {
    const img = chart.getDataURL({ type: 'png', pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = img
    a.download = `${chartTitles[idx]}.png`
    a.click()
  })
}

onMounted(loadData)
</script>

<style scoped>
.charts-demo {
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
}

.toolbar-subtitle {
  font-size: 0.85rem;
  color: var(--muted);
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
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

.error-icon {
  font-size: 1.125rem;
}

/* Chart Grid */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.25rem;
}

.chart-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: all var(--transition);
}

.chart-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.chart-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.chart-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: var(--bg-subtle);
  color: var(--muted);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.chart {
  height: 260px;
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
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
