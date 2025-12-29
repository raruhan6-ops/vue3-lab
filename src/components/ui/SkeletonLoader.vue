<template>
  <div 
    class="skeleton-loader" 
    :style="{ width, height, borderRadius }"
  ></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  borderRadius: { type: String, default: '4px' }
})
</script>

<style scoped>
.skeleton-loader {
  background: #e2e8f0;
  background-image: linear-gradient(
    90deg,
    #e2e8f0 0px,
    #f1f5f9 40px,
    #e2e8f0 80px
  );
  background-size: 600px;
  animation: shimmer 1.6s infinite linear;
}

.dark .skeleton-loader {
  background: #1e293b;
  background-image: linear-gradient(
    90deg,
    #1e293b 0px,
    #334155 40px,
    #1e293b 80px
  );
}

@keyframes shimmer {
  0% { background-position: -100px; }
  40%, 100% { background-position: 140px; }
}
</style>
