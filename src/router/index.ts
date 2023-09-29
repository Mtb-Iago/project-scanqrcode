import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
      path: '/',
      redirect: "/app",
    },
    {
      path: '/app',
      name: 'Dashboard',
      redirect: "/app/scanner",
      children: [
        {
          path: "scanner",
          name: "scanner",
          component: () => import("@/views/scanner/ScannerView.vue"),
        },
      ]
    },
    {
      path: '/teste',
      redirect: "/teste"
    },
  ]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;