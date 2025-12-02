<template>
  <section class="lab-page">
    <header class="page-header">
      <div class="header-content">
        <span class="lab-badge">Lab 03</span>
        <h1>ECharts 数据可视化</h1>
        <p>使用 ECharts 库创建交互式图表，展示学生数据的多维度分析</p>
      </div>
    </header>
    
    <ChartsDemo />
  </section>
</template>

<script setup>
import ChartsDemo from '../components/ChartsDemo.vue'
</script>

<style scoped>
.lab-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 2rem;
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
</style>
