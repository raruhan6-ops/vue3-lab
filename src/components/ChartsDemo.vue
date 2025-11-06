<template>
  <section class="charts-demo">
    <h2>📊 学生成绩可视化面板 (ECharts)</h2>

    <div class="toolbar">
      <button @click="loadData" :disabled="loading">{{ loading ? '加载中...' : '🔄 刷新图表数据' }}</button>
      <button @click="exportCharts">📤 导出所有图表</button>
    </div>

    <p v-if="error" class="error">数据加载失败: {{ error }}</p>

    <div v-if="!error" class="chart-grid">
      <div v-for="(chart, i) in chartIds" :key="i" class="chart-box">
        <h3>{{ chartTitles[i] }}</h3>
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
  '课程平均分（柱状图）',
  '课程参与度（柱状图）',
  '学期分布（折线图）',
  '状态占比（饼图）',
  '平均成绩趋势（折线图）',
]

const loading = ref(false)
const error = ref('')
const charts = ref({})

const colors = ['#42b883', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#e74c3c']

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

  // Chart 1 - Avg Scores
  charts.value.avgScore = echarts.init(document.getElementById('avgScore'))
  charts.value.avgScore.setOption({
    color: colors,
    xAxis: { type: 'category', data: data.scoresByCourse.map(c => c.course) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data.scoresByCourse.map(c => c.avg) }],
    title: { text: '平均分' },
  })

  // Chart 2 - Participation
  charts.value.participation = echarts.init(document.getElementById('participation'))
  charts.value.participation.setOption({
    color: colors,
    xAxis: { type: 'category', data: data.courseParticipation.map(c => c.course) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data.courseParticipation.map(c => c.count) }],
  })

  // Chart 3 - Semester Distribution
  charts.value.semester = echarts.init(document.getElementById('semester'))
  charts.value.semester.setOption({
    color: ['#9b59b6'],
    xAxis: { type: 'category', data: data.semesterDistribution.map(s => s.semester) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: data.semesterDistribution.map(s => s.count) }],
  })

  // Chart 4 - Status Distribution
  charts.value.status = echarts.init(document.getElementById('status'))
  charts.value.status.setOption({
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: data.statusDist.map(s => ({ value: s.value, name: s.name })),
        label: { show: true, formatter: '{b}: {d}%' },
      },
    ],
    color: ['#2ecc71', '#e74c3c'],
  })

  // Chart 5 - Avg Trend
  charts.value.trend = echarts.init(document.getElementById('trend'))
  charts.value.trend.setOption({
    xAxis: { type: 'category', data: data.avgTrend.map(d => d.month) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: data.avgTrend.map(d => d.avg) }],
    color: ['#3498db'],
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
  padding: 2rem;
  background: linear-gradient(180deg, #f0fff4, #e6fffa);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
.chart-box {
  background: white;
  border-radius: 12px;
  padding: 0.6rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.chart {
  height: 260px;
}
.error { color: #e74c3c; font-weight: bold; }
</style>
