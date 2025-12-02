<template>
  <section class="lab-page">
    <header class="page-header">
      <div class="header-content">
        <span class="lab-badge">Lab 02</span>
        <h1>API 数据交互</h1>
        <p>学习使用 Axios 进行 RESTful API 调用，实现学生信息的 CRUD 操作</p>
      </div>
    </header>
    
    <ApiDemo />
  </section>
</template>

<script setup>
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
