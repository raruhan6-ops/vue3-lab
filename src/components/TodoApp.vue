<template>
  <div class="component-card">
    <div class="card-header">
      <span class="card-icon">📝</span>
      <h3>任务清单</h3>
      <span v-if="tasks.length" class="task-count">{{ tasks.length }} 个任务</span>
    </div>
    <div class="card-body">
      <form @submit.prevent="addTask" class="todo-form">
        <input 
          v-model="newTask" 
          placeholder="输入新任务..."
          class="todo-input"
        />
        <button type="submit" class="btn-add" :disabled="!newTask.trim()">
          添加
        </button>
      </form>
      
      <TransitionGroup name="list" tag="ul" class="todo-list" v-if="tasks.length">
        <li v-for="(task, i) in tasks" :key="task + i" class="todo-item">
          <span class="task-text">{{ task }}</span>
          <button @click="removeTask(i)" class="btn-remove" title="删除">
            🗑️
          </button>
        </li>
      </TransitionGroup>
      
      <div v-else class="empty-state">
        <span class="empty-icon">🌟</span>
        <p>暂无任务，添加一个吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newTask = ref('')
const tasks = ref([])

function addTask() {
  if (newTask.value.trim()) {
    tasks.value.push(newTask.value.trim())
    newTask.value = ''
  }
}

function removeTask(index) {
  tasks.value.splice(index, 1)
}
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

.task-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
}

.card-body {
  padding: 1.25rem;
}

.todo-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  background: var(--input-bg, var(--bg));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.9rem;
  color: var(--text);
  transition: all var(--transition);
}

.todo-input::placeholder {
  color: var(--muted);
}

.todo-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.btn-add {
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-subtle);
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  transition: all var(--transition);
}

.todo-item:hover {
  background: var(--primary-50);
}

.task-text {
  flex: 1;
  font-size: 0.9rem;
}

.btn-remove {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all var(--transition);
}

.btn-remove:hover {
  opacity: 1;
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted);
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* List transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
