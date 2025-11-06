<template>
  <section class="page">
    <h2>🧪 Lab 1 — 基础组件</h2>
    <HelloVue />
    <ClickCounter />
    <TodoApp />
  </section>
</template>

<script setup>
import HelloVue from '../components/HelloVue.vue'
import ClickCounter from '../components/ClickCounter.vue'
import TodoApp from '../components/TodoApp.vue'
</script>

<style scoped>
.page { display: grid; gap: 1rem; }
</style>
