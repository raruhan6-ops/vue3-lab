<template>
  <section class="lab-page">
    <LabHeader
      lab-number="01"
      title="基础组件"
      description="学习 Vue 3 组件基础：响应式状态、事件处理、组件通信"
    />
    
    <div class="components-grid">
      <HelloVue />
      <ClickCounter />
      <TodoApp />
    </div>
  </section>
</template>

<script setup>
import LabHeader from '../components/ui/LabHeader.vue'
import HelloVue from '../components/HelloVue.vue'
import ClickCounter from '../components/ClickCounter.vue'
import TodoApp from '../components/TodoApp.vue'
</script>

<style scoped>
.lab-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.components-grid {
  display: grid;
  gap: 1.5rem;
}
</style>
