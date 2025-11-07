<template>
  <div id="app" :class="isDark ? 'dark-theme' : 'bright-theme'">
    <!-- ✨ Animated Background -->
    <div class="animated-bg"></div>

    <!-- 🌟 Header -->
    <header class="app-header">
      <div class="app-title">
        <!-- Clickable Logo -->
        <RouterLink to="/" class="logo-link">
          <img src="/logo.svg" alt="RAR Logo" class="logo" />
        </RouterLink>
        <h1>🎓 学生信息可视化平台</h1>
      </div>

      <nav class="nav">
        <RouterLink v-for="tab in tabs" :key="tab.path" :to="tab.path" active-class="active">
          {{ tab.label }}
        </RouterLink>

        <!-- 🌗 Theme Toggle Button -->
        <button class="theme-toggle" @click="toggleTheme">
          {{ isDark ? '☀️ 明亮模式' : '🌙 夜间模式' }}
        </button>
      </nav>
    </header>

    <!-- 🧩 Animated Main Content -->
    <transition name="fade-slide" mode="out-in">
      <main class="main-content">
        <RouterView />
      </main>
    </transition>

    <!-- ⚙️ Footer -->
    <footer class="footer">
      <p>© 2025 <strong>Rejuan Ahmed Ruhan</strong> | Vue 3 实验平台</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from "vue-router"
import { ref, onMounted } from "vue"

// 🧭 Navigation Tabs
const tabs = [
  { path: "/lab1", label: "Lab 1" },
  { path: "/lab2", label: "Lab 2" },
  { path: "/lab3", label: "Lab 3" },
  { path: "/lab4", label: "Lab 4" }
]

// 🌗 Dark Mode State
const isDark = ref(false)

// ✅ Load saved theme
onMounted(() => {
  const saved = localStorage.getItem("theme")
  if (saved === "dark") {
    isDark.value = true
    document.documentElement.classList.add("dark")
  }
})

// ✅ Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle("dark", isDark.value)
  localStorage.setItem("theme", isDark.value ? "dark" : "light")
}
</script>

<style scoped>
/* 🌈 Core Theme Variables (Light) */
:root {
  --color-primary: #42b883;
  --color-secondary: #2ecc71;
  --color-accent: #00adb5;
  --color-text: #1a1a1a;
  --color-bg: #f9fafc;
  --color-card: #ffffff;
  --shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  --radius: 16px;
}

/* 🌙 Dark Theme Overrides */
.dark {
  --color-bg: #121212;
  --color-card: #1e1e1e;
  --color-text: #eaeaea;
  --color-primary: #3ddc84;
  --color-secondary: #23d18b;
  --color-accent: #00bcd4;
  --shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
}

/* 🌤 Animated Background */
.animated-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #d9f6ec, #e0f7fa, #fefefe);
  background-size: 300% 300%;
  animation: bgFlow 10s ease infinite;
  z-index: -2;
}
.dark .animated-bg {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}
@keyframes bgFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 🌟 Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(90deg, #42b883, #2ecc71, #00adb5);
  background-size: 200% 200%;
  animation: headerFlow 8s ease infinite;
  color: white;
  text-align: center;
  padding: 1.2rem 2rem;
  border-radius: 0 0 var(--radius) var(--radius);
  box-shadow: var(--shadow);
}
@keyframes headerFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}
.logo-link {
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, filter 0.3s ease;
}
.logo-link:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
  cursor: pointer;
}
.logo {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 6px rgba(255, 255, 255, 0.5));
  animation: floatLogo 4s ease-in-out infinite;
}
@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.app-title h1 {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #fff, #fefae0, #f0fdf4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  animation: shimmer 4s linear infinite;
}
@keyframes shimmer {
  0% { background-position: 0%; }
  100% { background-position: 300%; }
}

/* 🔘 Navigation */
.nav {
  margin-top: 0.8rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.nav a {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.nav a:hover {
  background: #fff;
  color: var(--color-primary);
  transform: translateY(-2px);
}
.nav a.active {
  background: #fff;
  color: var(--color-accent);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
}

/* 🌗 Theme Toggle */
.theme-toggle {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

/* 🧩 Main Content */
.main-content {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  color: var(--color-text);
  transition: all 0.4s ease;
}

/* ⚙️ Footer */
.footer {
  text-align: center;
  color: #555;
  margin-top: 3rem;
  padding: 1rem;
  font-size: 0.95rem;
  border-top: 1px solid #e0e0e0;
  transition: color 0.4s ease;
}
.dark .footer {
  color: #ccc;
  border-top-color: #333;
}

/* 🌬 Page Transition */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.6s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>