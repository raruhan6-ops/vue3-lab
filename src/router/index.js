import { createRouter, createWebHistory } from 'vue-router'

// ✅ Import main views and components
import HomeView from '../views/HomeView.vue'
import HelloVue from '../components/HelloVue.vue'
import ApiDemo from '../components/ApiDemo.vue'
import ChartsDemo from '../components/ChartsDemo.vue'
import G2Charts from '../components/G2Charts.vue'

// ✅ Define all routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Vue3 实验平台 - 首页' },
  },
  {
    path: '/lab1',
    name: 'Lab1',
    component: HelloVue,
    meta: { title: 'Lab 1 - Vue 基础交互' },
  },
  {
    path: '/lab2',
    name: 'Lab2',
    component: ApiDemo,
    meta: { title: 'Lab 2 - 数据交互实验' },
  },
  {
    path: '/lab3',
    name: 'Lab3',
    component: ChartsDemo,
    meta: { title: 'Lab 3 - 图表可视化' },
  },
  {
    path: '/lab4',
    name: 'Lab4',
    component: G2Charts,
    meta: { title: 'Lab 4 - 高级可视化' },
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/', // redirect invalid URLs to homepage
  },
]

// ✅ Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Optional: Update browser tab title dynamically
router.afterEach((to) => {
  document.title = to.meta.title || 'Vue3 实验平台'
})

export default router
