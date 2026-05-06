import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Admin from '../views/Admin.vue';
import Login from '../views/Login.vue';
import { secureStorage, parseJwt } from '../utils/storage';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true, layout: 'main', title: 'Dashboard' }
  },
  { 
    path: '/containers', 
    name: 'Containers', 
    component: () => import('../views/Containers.vue'),
    meta: { requiresAuth: true, layout: 'main', title: 'Container Management' }
  },
  { 
    path: '/logs', 
    name: 'Logs', 
    component: () => import('../views/Logs.vue'),
    meta: { requiresAuth: true, layout: 'main', title: 'Live Log Stream' }
  },
  { 
    path: '/health', 
    name: 'Health', 
    component: () => import('../views/Health.vue'),
    meta: { requiresAuth: true, layout: 'main', title: 'System Health' }
  },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'main', title: 'Admin Control Center' }
  },
  { 
    path: '/audit', 
    name: 'Audit', 
    component: () => import('../views/Audit.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'main', title: 'Security Audits' }
  },
  { 
    path: '/settings', 
    name: 'Settings', 
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true, layout: 'main', title: 'Account Settings' }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { title: 'Sign In' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = secureStorage.getItem('token');
  const claims = parseJwt(token);
  const isAdmin = claims?.is_admin === true;

  // Update Page Title
  const baseTitle = 'DockLog';
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
