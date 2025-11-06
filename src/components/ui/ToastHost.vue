<template>
  <div class="toast-host">
    <transition-group name="slide-fade">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
      >
        <span v-if="t.type === 'success'">✅</span>
        <span v-else-if="t.type === 'error'">❌</span>
        <span v-else-if="t.type === 'warning'">⚠️</span>
        <span v-else>ℹ️</span>
        <p>{{ t.message }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast"
const { toasts } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 2000;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: white;
  color: #111827;
  border-left: 6px solid #22c55e;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 300px;
  font-weight: 500;
  animation: popIn 0.3s ease;
}

.toast.success {
  border-color: #16a34a;
}
.toast.error {
  border-color: #ef4444;
}
.toast.warning {
  border-color: #f59e0b;
}
.toast.info {
  border-color: #3b82f6;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
