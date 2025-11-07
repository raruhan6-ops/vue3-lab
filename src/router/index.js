import { createRouter, createWebHistory } from 'vue-router'

// ✅ Import main views and components
import HomeView from '../views/HomeView.vue'
import Lab1View from '../views/Lab1.vue'
import Lab2View from '../views/Lab2.vue'
import Lab3View from '../views/Lab3.vue'
import Lab4View from '../views/Lab4.vue'
import HelloVue from '../components/HelloVue.vue'
import ApiDemo from '../components/ApiDemo.vue'
import ChartsDemo from '../components/ChartsDemo.vue'
import G2Charts from '../components/G2Charts.vue'

// ✅ Define all routes
export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home',
      bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' // purple -> indigo
    },
  },
  {
    path: '/lab1',
    name: 'Lab1',
    component: Lab1View,
    meta: {
      title: 'Lab 1 - Vue 基础交互',
      bg: 'linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)' // warm pink
    },
  },
  {
    path: '/lab2',
    name: 'Lab2',
    component: () => import('../views/Lab2.vue'),
    meta: {
      title: 'Lab 2 - Charts',
      bg: 'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)' // cyan -> blue
    },
  },
  {
    path: '/lab3',
    name: 'Lab3',
    component: () => import('../views/Lab3.vue'),
    meta: {
      title: 'Lab 3',
      bg: 'linear-gradient(135deg,#a8e063 0%,#56ab2f 100%)' // green
    },
  },
  {
    path: '/lab4',
    name: 'Lab4',
    component: () => import('../views/Lab4.vue'),
    meta: {
      title: 'Lab 4',
      bg: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)' // warm orange
    },
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
