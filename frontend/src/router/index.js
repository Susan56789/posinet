import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import('@/components/PageLayout.vue'),
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/components/AuthPage/index.vue'),
                meta: { breadcrumb: 'Login', title: 'Login' }
            },
            {
                path: 'admin',
                name: 'Admin',
                component: () => import('@/components/AdminPage/index.vue'),
                meta: { breadcrumb: 'Admin', title: 'Admin' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'inventory',
                name: 'Inventory',
                component: () => import('@/components/InventoryPage/index.vue'),
                meta: { breadcrumb: 'Inventory', title: 'Inventory' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'sales',
                name: 'Sales',
                component: () => import('@/components/SalesPage/index.vue'),
                meta: { breadcrumb: 'Sales', title: 'Sales' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'customers',
                name: 'Customers',
                component: () => import('@/components/CustomersPage/index.vue'),
                meta: { breadcrumb: 'Customers', title: 'Customers' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'suppliers',
                name: 'Suppliers',
                component: () => import('@/components/SuppliersPage/index.vue'),
                meta: { breadcrumb: 'Suppliers', title: 'Suppliers' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'item-repair',
                name: 'ItemRepair',
                component: () => import('@/components/ItemRepairPage/index.vue'),
                meta: { breadcrumb: 'Item Repair', title: 'Item Repair' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'expenses',
                name: 'Expenses',
                component: () => import('@/components/ExpensesPage/index.vue'),
                meta: { breadcrumb: 'Expenses', title: 'Expenses' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            {
                path: 'reports',
                name: 'Reports',
                component: () => import('@/components/ReportsPage/index.vue'),
                meta: { breadcrumb: 'Reports', title: 'Reports' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login');
                    next();
                }
            },
            // Add other routes as needed
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
