<template>
  <section class="lab-page">
    <LabHeader
      lab-number="03"
      title="ECharts 数据可视化"
      description="使用 ECharts 库创建交互式图表，展示学生数据的多维度分析"
    />
    
    <ChartsDemo />
  </section>
</template>

<script setup>
import LabHeader from '../components/ui/LabHeader.vue'
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
</style>
