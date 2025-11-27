import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Alias from '../components/Alias.vue'
import Counter from '../components/Counter.vue'

const routes = [
  { path: '/bg', component: Home },
  { path: '/alias', component: Alias },
  { path: '/counter', component: Counter },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
