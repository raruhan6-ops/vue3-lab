import { createRouter, createWebHistory } from 'vue-router'

// Use relative imports
import Lab1 from '../views/Lab1.vue'
import Lab2 from '../views/Lab2.vue'
import Lab3 from '../views/Lab3.vue'
import Lab4 from '../views/Lab4.vue'

const routes = [
  { path: '/', redirect: '/lab1' },
  { path: '/lab1', name: 'Lab1', component: Lab1 },
  { path: '/lab2', name: 'Lab2', component: Lab2 },
  { path: '/lab3', name: 'Lab3', component: Lab3 },
  { path: '/lab4', name: 'Lab4', component: Lab4 },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
