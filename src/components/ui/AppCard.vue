<template>
  <section class="card">
    <header v-if="$slots.title || $slots.actions" class="card-head">
      <h3 class="title"><slot name="title" /></h3>
      <div class="actions"><slot name="actions" /></div>
    </header>
    <div><slot /></div>
  </section>
</template>

<style scoped>
.card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; }
.title { margin:0; font-size:1rem; }
.actions :deep(.btn) { font-size:.9rem; }
</style>
