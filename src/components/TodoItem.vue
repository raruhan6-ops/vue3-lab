<template>
  <li class="item">
    {{ task }}
    <button @click="$emit('remove')">🗑</button>
  </li>
</template>

<script setup>
defineProps(['task'])
</script>

<style scoped>
.item {
  list-style: none;
  padding: 0.4rem;
  margin: 0.3rem 0;
  background: #f4f4f4;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
button {
  background: #ff6b6b;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
}
button:hover {
  background: #e33e3e;
}
</style>
