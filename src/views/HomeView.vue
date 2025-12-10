<template>
  <section class="home">
    <!-- 🌟 Hero Section -->
    <div class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🚀</span>
          <span>Vue 3 Composition API</span>
        </div>
        
        <h1 class="hero-title">
          <span class="title-gradient">学生信息</span>
          <span class="title-normal">可视化平台</span>
        </h1>
        
        <p class="hero-description">
          一个专为学生设计的交互式可视化平台，通过实践探索 Vue 3 的强大功能。
          数据驱动、组件化架构、响应式设计。
        </p>
        
        <div class="hero-actions">
          <RouterLink to="/lab1" class="btn btn-primary">
            <span>🧪</span>
            开始实验
          </RouterLink>
          <RouterLink to="/lab7" class="btn btn-primary">
            <span>🗺️</span>
            直达中国地图
          </RouterLink>
          <a href="https://vuejs.org/" target="_blank" rel="noopener" class="btn btn-outline">
            <span>📚</span>
            了解 Vue 3
          </a>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">6</span>
            <span class="stat-label">实验模块</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">3+</span>
            <span class="stat-label">可视化库</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">∞</span>
            <span class="stat-label">学习可能</span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="visual-card">
          <div class="code-block">
            <div class="code-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="filename">App.vue</span>
            </div>
            <pre class="code-content"><code><span class="keyword">import</span> { ref, computed } <span class="keyword">from</span> <span class="string">'vue'</span>

<span class="keyword">const</span> students = <span class="function">ref</span>([])
<span class="keyword">const</span> totalScore = <span class="function">computed</span>(() => 
  students.value.<span class="function">reduce</span>(
    (sum, s) => sum + s.score, 0
  )
)</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 🚀 Feature Section -->
    <div class="features-section">
      <div class="section-header">
        <span class="section-badge">功能特性</span>
        <h2>探索平台核心功能</h2>
        <p>通过六个精心设计的实验模块，掌握 Vue 3 开发的方方面面</p>
      </div>

      <div class="features-grid">
        <div
          v-for="(item, i) in features"
          :key="i"
          class="feature-card"
        >
          <div class="feature-icon" :style="{ background: item.gradient }">
            {{ item.icon }}
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <div class="feature-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 Labs Preview -->
    <div class="labs-section">
      <div class="section-header">
        <span class="section-badge">实验模块</span>
        <h2>快速进入实验</h2>
        <p>选择一个实验模块开始你的学习之旅</p>
      </div>

      <div class="labs-grid">
        <RouterLink 
          v-for="lab in labs" 
          :key="lab.path" 
          :to="lab.path"
          class="lab-card"
        >
          <span class="lab-icon">{{ lab.icon }}</span>
          <span class="lab-number">{{ lab.number }}</span>
          <h4>{{ lab.title }}</h4>
          <p>{{ lab.desc }}</p>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { 
    icon: "🧩", 
    title: "模块化实验", 
    desc: "通过组件化结构清晰掌握 Vue 3 模块开发，学习 Composition API。",
    tags: ["Components", "Composables"],
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  { 
    icon: "📊", 
    title: "数据可视化", 
    desc: "使用 ECharts、G2、AntV G6 等库实现专业级交互式数据展示。",
    tags: ["ECharts", "G2", "G6"],
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
  { 
    icon: "⚡", 
    title: "响应式系统", 
    desc: "深入理解 Vue 3 的 Reactivity 系统，让页面随数据实时更新。",
    tags: ["ref", "reactive", "computed"],
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  { 
    icon: "🎨", 
    title: "现代设计", 
    desc: "采用现代 CSS 技术，渐变色彩与流畅动画带来愉悦体验。",
    tags: ["CSS Variables", "Animations"],
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
  },
]

const labs = [
  { path: "/lab7", icon: "🗺️", number: "07", title: "中国地图", desc: "L7 + 高德地图" },
  { path: "/lab1", icon: "🧪", number: "01", title: "基础组件", desc: "Vue 组件基础" },
  { path: "/lab2", icon: "📡", number: "02", title: "API 交互", desc: "Axios 数据请求" },
  { path: "/lab3", icon: "📊", number: "03", title: "ECharts", desc: "基础图表可视化" },
  { path: "/lab4", icon: "🧠", number: "04", title: "G2 图表", desc: "高级交互图表" },
  { path: "/lab5", icon: "🕸️", number: "05", title: "关系网络", desc: "G6 关系可视化" },
  { path: "/lab6", icon: "🎯", number: "06", title: "综合实验", desc: "G6 交互可视化" },
]
</script>

<style scoped>
.home {
  padding: 0;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 2rem 0 3rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}

.badge-icon {
  font-size: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
}

.title-gradient {
  display: block;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 50%, var(--secondary) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.title-normal {
  display: block;
  color: var(--text);
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius);
  text-decoration: none;
  transition: all var(--transition);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
}

.visual-card {
  perspective: 1000px;
}

.code-block {
  background: var(--panel-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transform: rotateY(-5deg) rotateX(5deg);
  transition: transform var(--transition);
}

.code-block:hover {
  transform: rotateY(0) rotateX(0);
}

.code-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.filename {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--muted);
  font-family: var(--font-mono);
}

.code-content {
  padding: 1.25rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--text-secondary);
  overflow-x: auto;
}

.code-content .keyword { color: #c678dd; }
.code-content .string { color: #98c379; }
.code-content .function { color: #61afef; }

/* Features Section */
.features-section {
  padding: 3rem 0;
  border-top: 1px solid var(--border);
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 2rem;
  margin: 0 0 0.75rem 0;
}

.section-header p {
  color: var(--muted);
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  transition: all var(--transition);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: var(--bg-subtle);
  color: var(--muted);
  border-radius: var(--radius-full);
}

/* Labs Section */
.labs-section {
  padding: 3rem 0 1rem;
  border-top: 1px solid var(--border);
}

.labs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.lab-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition);
  overflow: hidden;
}

.lab-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.lab-card:hover .lab-icon {
  transform: scale(1.15);
}

.lab-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  transition: transform var(--transition);
}

.lab-number {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  font-family: var(--font-mono);
}

.lab-card h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: var(--text);
}

.lab-card p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}

/* Responsive */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-content {
    align-items: center;
  }
  
  .hero-description {
    max-width: 100%;
  }
  
  .hero-visual {
    display: none;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 1.875rem;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .hero-stats {
    flex-wrap: wrap;
  }
}
</style>
