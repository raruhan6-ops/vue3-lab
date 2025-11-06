<template>
  <section class="home">
    <!-- 🌟 Hero Section -->
    <div class="hero">
      <div class="text">
        <h1 data-aos="fade-up">👋 欢迎来到 Vue 3 实验平台</h1>
        <p data-aos="fade-up" data-aos-delay="150">
          一个专为学生设计的交互式可视化平台，探索 Vue 3 的强大功能。
        </p>
        <div class="actions" data-aos="fade-up" data-aos-delay="300">
          <RouterLink to="/lab1" class="btn start-btn">进入实验</RouterLink>
          <a href="https://vuejs.org/" target="_blank" class="btn learn-btn">了解 Vue 3</a>
        </div>
      </div>
    </div>

    <!-- 🚀 Feature Section -->
    <div class="features">
      <div
        v-for="(item, i) in features"
        :key="i"
        class="feature"
        data-aos="fade-up"
        :data-aos-delay="i * 150"
      >
        <div class="icon">{{ item.icon }}</div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { icon: "🧩", title: "模块化实验", desc: "通过组件化结构清晰掌握 Vue 3 模块开发。" },
  { icon: "📊", title: "数据可视化", desc: "使用 G2、Charts.js 等库实现交互式数据展示。" },
  { icon: "⚡", title: "动态交互", desc: "响应式系统让页面随用户操作实时更新。" },
  { icon: "🎨", title: "现代设计", desc: "亮色渐变与动画效果带来愉悦体验。" },
]
</script>

<style scoped>
.home {
  padding: 3rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  animation: fadeIn 1s ease forwards;
}

/* HERO SECTION */
.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.text h1 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(90deg, #42b883, #00adb5, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shimmer 6s linear infinite;
}

.text p {
  font-size: 1.2rem;
  color: #222;
  margin-top: 1rem;
  line-height: 1.6;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* BUTTONS */
.btn {
  padding: 0.8rem 1.4rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.start-btn {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: white;
  box-shadow: 0 6px 12px rgba(66, 184, 131, 0.3);
}
.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(66, 184, 131, 0.4);
}

.learn-btn {
  background: #f0fdf4;
  color: #00adb5;
  border: 2px solid #00adb5;
}
.learn-btn:hover {
  background: #00adb5;
  color: white;
  transform: translateY(-3px);
}

/* FEATURES */
.features {
  margin-top: 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.feature:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.feature .icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}
.feature h3 {
  font-size: 1.3rem;
  color: var(--color-primary);
}
.feature p {
  color: #555;
  font-size: 0.95rem;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: 0%; }
  100% { background-position: 300%; }
}
</style>
