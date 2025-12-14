import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Alias from '../components/Alias.vue'
import Counter from '../components/Counter.vue'
import Codenames from '../components/Codenames.vue'

const routes = [
  { path: '/bg', component: Home },
  { path: '/alias/:roomId', component: Alias },
  { path: '/codenames/:roomId', component: Codenames },
  { path: '/counter/:roomId', component: Counter },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
