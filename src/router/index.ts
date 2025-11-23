import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Counter from '../components/Counter.vue'

const routes = [
  { path: '/bg', component: Home },
  { path: '/counter', component: Counter },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
