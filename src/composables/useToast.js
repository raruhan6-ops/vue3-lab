import { ref } from "vue"
const toasts = ref([])

export function useToast() {
  const show = (message, type = "info", ms = 2000) => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, ms)
  }
  return { toasts, show }
}
