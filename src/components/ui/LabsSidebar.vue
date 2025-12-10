<template>
  <nav class="sidebar">
    <ul>
      <li v-for="lab in labs" :key="lab.path">
        <RouterLink :to="lab.path" class="sidebar-link">
          <span class="sidebar-icon">{{ lab.icon }}</span>
          <span class="sidebar-title">{{ lab.title }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const labs = [
  { path: "/lab7", icon: "🗺️", title: "中国地图" },
  { path: "/lab1", icon: "🧪", title: "基础组件" },
  { path: "/lab2", icon: "📡", title: "API 交互" },
  { path: "/lab3", icon: "📊", title: "ECharts" },
  { path: "/lab4", icon: "🧠", title: "G2 图表" },
  { path: "/lab5", icon: "🕸️", title: "关系网络" },
  { path: "/lab6", icon: "🎯", title: "综合实验" },
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 180px;
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: 2rem 0 0 0;
  z-index: 100;
}
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--text);
  text-decoration: none;
  font-size: 1rem;
  border-radius: var(--radius);
  transition: background 0.2s;
}
.sidebar-link:hover {
  background: var(--primary-50);
  color: var(--primary);
}
.sidebar-icon {
  font-size: 1.3rem;
}
.sidebar-title {
  font-weight: 600;
}
</style>
