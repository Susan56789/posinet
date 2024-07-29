// src/router/index.js
import Vue from 'vue';
import Router from 'vue-router';
import Auth from '@/components/Auth.vue';
import Admin from '@/components/Admin.vue';
import Inventory from '@/components/Inventory.vue';
// Import other components

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Auth
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin,
            beforeEnter: (to, from, next) => {
                const token = localStorage.getItem('token');
                if (!token) return next('/login');
                next();
            }
        },
        {
            path: '/inventory',
            name: 'Inventory',
            component: Inventory,
            beforeEnter: (to, from, next) => {
                const token = localStorage.getItem('token');
                if (!token) return next('/login');
                next();
            }
        },
        // Add other routes
    ]
});
