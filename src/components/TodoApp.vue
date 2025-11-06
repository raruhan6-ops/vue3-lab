<template>
  <section class="todo">
    <h2>Todo List</h2>
    <input v-model="newTask" placeholder="Add task" />
    <button @click="addTask">Add</button>
    <ul>
      <TodoItem v-for="(task, i) in tasks" :key="i" :task="task" @remove="removeTask(i)" />
    </ul>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const newTask = ref('')
const tasks = ref([])

function addTask() {
  if (newTask.value.trim()) {
    tasks.value.push(newTask.value)
    newTask.value = ''
  }
}
function removeTask(index) {
  tasks.value.splice(index, 1)
}
</script>

<style scoped>
.todo {
  text-align: left;
  margin: 1rem auto;
}
input {
  padding: 0.4rem;
  margin-right: 0.4rem;
}
button {
  background: #42b883;
  border: none;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #2f976f;
}
</style>
