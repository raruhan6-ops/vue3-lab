<template>
  <div id="app">
    <!-- 🌟 Top Navigation Bar -->
    <header class="app-header">
      <div class="app-title">
        <img src="/logo.svg" alt="RAR Logo" class="logo" />
        <h1>🎓 学生信息可视化平台</h1>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          active-class="active"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>
    </header>

    <!-- Main Page Content -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2025 Rejuan Ahmed Ruhan | Vue 3 实验平台</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'

// Navigation Tabs
const tabs = [
  { path: '/lab1', label: 'Lab 1' },
  { path: '/lab2', label: 'Lab 2' },
  { path: '/lab3', label: 'Lab 3' },
  { path: '/lab4', label: 'Lab 4' }
]
</script>

<style scoped>
:root {
  --color-primary: #42b883;
  --color-secondary: #2ecc71;
  --color-accent: #3498db;
  --radius: 16px;
  --shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* ------------------ Header ------------------ */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  background: linear-gradient(
    120deg,
    rgba(66, 184, 131, 0.8),
    rgba(46, 204, 113, 0.75),
    rgba(52, 152, 219, 0.75)
  );
  color: white;
  padding: 1rem 2rem;
  border-radius: 0 0 var(--radius) var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.5rem;
  text-align: center;
  animation: fadeIn 1.2s ease-in-out;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.app-title h1 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
}

/* Animated Logo */
.logo {
  width: 50px;
  height: 50px;
  margin-right: 0.4rem;
  animation: pulse 4s infinite ease-in-out;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
  transition: transform 0.3s ease;
}
.logo:hover {
  transform: rotate(12deg) scale(1.1);
}

/* ------------------ Navigation ------------------ */
.nav {
  display: flex;
  gap: 1rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav a {
  color: white;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: 12px;
  transition: 0.25s ease;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav a.active {
  background: rgba(255, 255, 255, 0.5);
  color: #fff;
  box-shadow: 0 3px 8px rgba(255, 255, 255, 0.3);
}

/* ------------------ Main Content ------------------ */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background: linear-gradient(180deg, #f8fdfb, #ecf8f3);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  min-height: calc(100vh - 200px);
  animation: fadeUp 0.8s ease-out;
}

/* ------------------ Footer ------------------ */
.footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #555;
  padding: 1rem 0;
}

/* ------------------ Animations ------------------ */
@keyframes pulse {
  0% { filter: drop-shadow(0 0 0 rgba(66, 184, 131, 0.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(46, 204, 113, 0.8)); }
  100% { filter: drop-shadow(0 0 0 rgba(66, 184, 131, 0.3)); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

