<template>
  <section class="lab-page">
    <LabHeader
      lab-number="02"
      title="API 数据交互"
      description="学习使用 Axios 进行 RESTful API 调用，实现学生信息的 CRUD 操作"
    />
    
    <ApiDemo />
  </section>
</template>

<script setup>
import LabHeader from '../components/ui/LabHeader.vue'
import ApiDemo from '../components/ApiDemo.vue'
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
