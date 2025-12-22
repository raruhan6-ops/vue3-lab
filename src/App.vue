<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <!-- ✨ Animated Background -->
    <div class="animated-bg"></div>
    <div class="bg-pattern"></div>

    <!-- 🌟 Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="app-title">
          <RouterLink to="/" class="logo-link">
            <div class="logo-container">
              <img src="/logo.svg" alt="RAR Logo" class="logo" />
              <div class="logo-glow"></div>
            </div>
          </RouterLink>
          <div class="title-text">
            <h1>学生信息可视化平台</h1>
            <span class="subtitle">Vue 3 Interactive Lab</span>
          </div>
        </div>

        <nav class="nav">
          <div class="nav-links">
            <RouterLink
              v-for="tab in tabs"
              :key="tab.path"
              :to="tab.path"
              class="nav-link"
              active-class="active"
            >
              <span class="nav-icon">{{ tab.icon }}</span>
              <span class="nav-label">{{ tab.label }}</span>
            </RouterLink>
          </div>

          <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到明亮模式' : '切换到夜间模式'">
            <span class="toggle-icon">{{ isDark ? '☀️' : '🌙' }}</span>
            <span class="toggle-text">{{ isDark ? '明亮' : '夜间' }}</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- 🧩 Main Content -->
    <main class="main-wrapper">
      <div class="main-content">
        <transition name="page" mode="out-in">
          <RouterView />
        </transition>
        <Chatbot />
      </div>
    </main>

    <!-- ⚙️ Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>
          <span class="footer-brand">© 2025 Rejuan Ahmed Ruhan</span>
          <span class="footer-divider">|</span>
          <span class="footer-tech">Built with Vue 3 + Vite</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from "vue-router"
import { ref, onMounted, watch } from "vue"
import Chatbot from './components/Chatbot.vue'

const tabs = [
  { path: "/lab1", label: "Lab 1", icon: "🧪" },
  { path: "/lab2", label: "Lab 2", icon: "📡" },
  { path: "/lab3", label: "Lab 3", icon: "📊" },
  { path: "/lab4", label: "Lab 4", icon: "🧠" },
  { path: "/lab5", label: "Lab 5", icon: "🕸️" },
  { path: "/lab6", label: "Lab 6", icon: "🎯" },
  { path: "/lab7", label: "Lab 7", icon: "🗺️" },
  { path: "/lab8", label: "Lab 8", icon: "📍" },
]

const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem("theme")
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved === "dark" || (!saved && prefersDark)
  document.documentElement.classList.toggle("dark", isDark.value)
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle("dark", isDark.value)
  localStorage.setItem("theme", isDark.value ? "dark" : "light")
}
</script>

<style scoped>
/* 🌤 Animated Background */
.animated-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, 
    var(--bg) 0%, 
    var(--bg-subtle) 50%, 
    var(--bg) 100%
  );
  z-index: -2;
  transition: background var(--transition-slow);
}

.bg-pattern {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.4;
  z-index: -1;
}

/* 🌟 Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, 
    var(--primary) 0%, 
    var(--primary-600) 50%,
    var(--accent) 100%
  );
  background-size: 200% 200%;
  animation: headerGradient 15s ease infinite;
  padding: 0;
  box-shadow: var(--shadow-lg);
}

@keyframes headerGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-link {
  display: flex;
  align-items: center;
  transition: transform var(--transition);
}
.logo-link:hover {
  transform: scale(1.05);
}

.logo-container {
  position: relative;
  width: 52px;
  height: 52px;
}

.logo {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
  animation: floatLogo 4s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.title-text {
  display: flex;
  flex-direction: column;
}

.title-text h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* 🔘 Navigation */
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.375rem;
  border-radius: var(--radius);
  backdrop-filter: blur(8px);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.active {
  background: white;
  color: var(--primary-700);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 1rem;
}

/* 🌗 Theme Toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.toggle-icon {
  font-size: 1.1rem;
}

/* 🧩 Main Content */
.main-wrapper {
  min-height: calc(100vh - 200px);
  padding: 2rem 1.5rem;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  transition: 
    background-color var(--transition),
    border-color var(--transition),
    box-shadow var(--transition);
}

/* ⚙️ Footer */
.footer {
  margin-top: auto;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border);
  background: var(--bg-subtle);
  transition: background-color var(--transition), border-color var(--transition);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.footer-brand {
  font-weight: 600;
  color: var(--text-secondary);
}

.footer-divider {
  color: var(--border);
}

.footer-tech {
  color: var(--muted);
}

/* 🌬 Page Transition */
.page-enter-active,
.page-leave-active {
  transition: all var(--transition-slow);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 📱 Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .nav {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-link {
    padding: 0.625rem;
  }
  
  .nav-icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .title-text h1 {
    font-size: 1.125rem;
  }
  
  .subtitle {
    font-size: 0.65rem;
  }
  
  .logo-container {
    width: 40px;
    height: 40px;
  }
  
  .main-wrapper {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1.25rem;
    border-radius: var(--radius-lg);
  }
}
</style>
