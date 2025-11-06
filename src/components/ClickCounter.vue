<template>
  <section class="counter">
    <button @click="count++">You clicked me {{ count }} times</button>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.counter {
  text-align: center;
  margin: 1rem 0;
}
button {
  background: #42b883;
  color: white;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #2f976f;
}
</style>
