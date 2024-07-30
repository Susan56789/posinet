import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import('@/components/PageLayout.vue'),
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/components/HomePage.vue'),
                meta: { breadcrumb: 'Home', title: 'Home' }
            },
            {
                path: 'login/user',
                name: 'UserLogin',
                component: () => import('@/components/AuthPage/index.vue'),
                meta: { breadcrumb: 'User Login', title: 'User Login' }
            },
            {
                path: 'login/admin',
                name: 'AdminLogin',
                component: () => import('@/components/AuthPage/AdminLogin.vue'),
                meta: { breadcrumb: 'Admin Login', title: 'Admin Login' }
            },
            {
                path: 'forgot-password',
                name: 'ForgotPassword',
                component: () => import('@/components/AuthPage/ForgotPassword.vue'),
                meta: { breadcrumb: 'Forgot Password', title: 'Forgot Password' }
            },
            {
                path: 'admin',
                name: 'Admin',
                component: () => import('@/components/AdminPage/index.vue'),
                meta: { breadcrumb: 'Admin', title: 'Admin' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    const role = localStorage.getItem('role');
                    if (!token || role !== 'admin') {
                        return next('/login/admin');
                    }
                    next();
                },
                children: [
                    {
                        path: '',
                        name: 'AdminDashboard',
                        component: () => import('@/components/AdminPage/index.vue'),
                        meta: { breadcrumb: 'Dashboard', title: 'Admin Dashboard' }
                    },
                    {
                        path: 'users',
                        name: 'AdminUsers',
                        component: () => import('@/components/AdminPage/AdminUsers.vue'),
                        meta: { breadcrumb: 'Users', title: 'Manage Users' }
                    },
                    {
                        path: 'products',
                        name: 'AdminProducts',
                        component: () => import('@/components/AdminPage/AdminProducts.vue'),
                        meta: { breadcrumb: 'Products', title: 'Manage Products' }
                    },
                    {
                        path: 'permissions',
                        name: 'AdminPermissions',
                        component: () => import('@/components/AdminPage/AdminPermissions.vue'),
                        meta: { breadcrumb: 'Permissions', title: 'Manage Permissions' }
                    },
                    {
                        path: 'reports',
                        name: 'AdminReports',
                        component: () => import('@/components/AdminPage/AdminReports.vue'),
                        meta: { breadcrumb: 'Reports', title: 'View Reports' }
                    }
                ]
            },
            {
                path: 'sales',
                name: 'Sales',
                component: () => import('@/components/SalesPage/index.vue'),
                meta: { breadcrumb: 'Sales', title: 'Sales' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
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
                    if (!token) return next('/login/user');
                    next();
                }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/components/UserProfile/index.vue'),
                meta: { breadcrumb: 'Profile', title: 'Profile' },
                beforeEnter: (to, from, next) => {
                    const token = localStorage.getItem('token');
                    if (!token) return next('/login/user');
                    next();
                }
            },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Posinet POS';
    next();
});

export default router;
