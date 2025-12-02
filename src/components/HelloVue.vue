<template>
  <div class="component-card">
    <div class="card-header">
      <span class="card-icon">👋</span>
      <h3>Hello Vue 3</h3>
    </div>
    <div class="card-body">
      <p>欢迎来到你的第一个 Vue 组件演示页面。</p>
      <p class="subtitle">这是一个基础的响应式计数器示例。</p>
      <button @click="count++" class="btn-counter">
        <span class="count-display">{{ count }}</span>
        <span class="count-label">点击次数</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.component-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition);
}

.component-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
}

.card-icon {
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
  text-align: center;
}

.card-body p {
  margin: 0 0 0.5rem 0;
  color: var(--text);
}

.subtitle {
  font-size: 0.875rem;
  color: var(--muted) !important;
  margin-bottom: 1.5rem !important;
}

.btn-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1.5rem 3rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-counter:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-counter:active {
  transform: translateY(-1px);
}

.count-display {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.count-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
}
</style>
