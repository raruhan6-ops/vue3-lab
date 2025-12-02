<template>
  <div class="component-card">
    <div class="card-header">
      <span class="card-icon">✨</span>
      <h3>响应式计数器</h3>
    </div>
    <div class="card-body">
      <p class="description">点击按钮体验 Vue 3 的响应式状态管理</p>
      
      <div class="counter-display">
        <span class="counter-value">{{ count }}</span>
      </div>
      
      <div class="counter-actions">
        <button @click="count > 0 && count--" class="btn-action btn-minus" :disabled="count === 0">
          −
        </button>
        <button @click="count++" class="btn-action btn-plus">
          ＋
        </button>
      </div>
      
      <button @click="count = 0" class="btn-reset" v-if="count > 0">
        重置
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

.description {
  color: var(--muted);
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.counter-display {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: var(--bg-subtle);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.counter-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
}

.counter-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-action {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-minus {
  background: var(--bg-subtle);
  color: var(--text);
}

.btn-minus:hover:not(:disabled) {
  background: var(--danger-50, #fef2f2);
  color: var(--danger, #ef4444);
}

.btn-minus:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-plus {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-plus:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-reset {
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-reset:hover {
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
  background: var(--danger-50, #fef2f2);
}
</style>
