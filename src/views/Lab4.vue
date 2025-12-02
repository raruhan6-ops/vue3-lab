<template>
  <section class="lab-page">
    <LabHeader
      lab-number="04"
      title="G2 高级图表"
      description="探索 AntV G2 的高级交互图表功能，实现专业级数据可视化"
    />
    
    <G2Charts />
  </section>
</template>

<script setup>
import LabHeader from '../components/ui/LabHeader.vue'
import G2Charts from '../components/G2Charts.vue'
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
