<template>
  <section class="lab1">
    <h2>🧩 Lab 1 — 基础组件演示</h2>

    <!-- Greeting Card -->
    <div class="card">
      <h3>Hello Vue 3 !</h3>
      <p>欢迎来到你的第一个 Vue 组件演示页面。</p>

      <button @click="count++" class="btn">
        👆 你点击了 {{ count }} 次
      </button>
    </div>

    <!-- Todo List -->
    <div class="todo">
      <h3>📝 Todo List</h3>
      <div class="todo-input">
        <input
          v-model="newTask"
          placeholder="Add task"
          @keyup.enter="addTask"
        />
        <button @click="addTask" class="btn">Add</button>
      </div>

      <ul v-if="tasks.length">
        <li v-for="(task, index) in tasks" :key="index">
          <span :class="{ done: task.done }" @click="toggleTask(index)">
            {{ task.text }}
          </span>
          <button @click="removeTask(index)" class="delete">🗑</button>
        </li>
      </ul>

      <p v-else class="empty">暂无任务，请添加一个任务。</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const newTask = ref('')
const tasks = ref([])

function addTask() {
  if (newTask.value.trim()) {
    tasks.value.push({ text: newTask.value.trim(), done: false })
    newTask.value = ''
  }
}

function toggleTask(index) {
  tasks.value[index].done = !tasks.value[index].done
}

function removeTask(index) {
  tasks.value.splice(index, 1)
}
</script>

<style scoped>
.lab1 {
  max-width: 750px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(180deg, #f8fffc, #eefaf3);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #2f855a;
  font-size: 1.6rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}
.card:hover {
  transform: translateY(-4px);
  transition: transform 0.3s ease;
}

/* Button */
.btn {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(66, 184, 131, 0.4);
}

/* Todo List */
.todo {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.todo-input {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.todo-input input {
  width: 60%;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.8rem;
  margin-bottom: 0.4rem;
  background: #f7fdf9;
  border-radius: 6px;
  transition: all 0.3s ease;
}
li:hover {
  background: #e9f9ef;
}
span {
  cursor: pointer;
}
span.done {
  text-decoration: line-through;
  color: #aaa;
}
.delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #e74c3c;
  transition: 0.2s;
}
.delete:hover {
  transform: scale(1.1);
}

.empty {
  color: #888;
  font-style: italic;
  margin-top: 0.5rem;
}
</style>
