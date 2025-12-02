<template>
  <header class="page-header" :class="{ 'with-action': $slots.action }">
    <div class="header-content">
      <span class="lab-badge">Lab {{ labNumber }}</span>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
    <slot name="action"></slot>
  </header>
</template>

<script setup>
defineProps({
  labNumber: {
    type: [String, Number],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* Responsive */
@media (max-width: 768px) {
  .page-header.with-action {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
