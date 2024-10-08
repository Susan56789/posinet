import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';


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
                component: () => import('@/components/AdminPage/AdminLayout.vue'),
                meta: { breadcrumb: 'Admin', title: 'Admin', requiresAuth: true, role: 'admin' },
                children: [
                    {
                        path: '',
                        name: 'AdminDashboard',
                        component: () => import('@/components/AdminPage/index.vue'),
                        meta: { breadcrumb: 'Dashboard', title: 'Admin Dashboard' }
                    }, {
                        path: 'profile',
                        name: 'AdminProfile',
                        component: () => import('@/components/AdminPage/AdminProfile.vue'),
                        meta: { breadcrumb: 'Admin Profile', title: 'Admin Profile' }
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
                        path: '/admin/sales',
                        name: 'SalesManagement',
                        component: () => import('@/components/AdminPage/SalesManagement.vue'),
                        meta: { breadcrumb: 'Sales Management', title: 'Sales Management' }
                    },
                    {
                        path: '/admin/customers',
                        name: 'CustomerManagement',
                        component: () => import('@/components/AdminPage/CustomerManagement.vue'),
                        meta: { breadcrumb: 'Customer Management', title: 'Customer Management' }
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
                meta: { breadcrumb: 'Sales', title: 'Sales', requiresAuth: true }
            },
            {
                path: '/receipt/:saleId',
                name: 'ReceiptPage',
                props: true,
                component: () => import('@/components/ReceiptPage.vue'),
                meta: { breadcrumb: 'Receipt', title: 'Receipt', requiresAuth: true }
            },
            {
                path: 'inventory',
                name: 'Inventory',
                component: () => import('@/components/InventoryPage/index.vue'),
                meta: { breadcrumb: 'Inventory', title: 'Inventory', requiresAuth: true }
            },
            {
                path: 'customers',
                name: 'Customers',
                component: () => import('@/components/CustomersPage/index.vue'),
                meta: { breadcrumb: 'Customers', title: 'Customers', requiresAuth: true }
            },
            {
                path: 'suppliers',
                name: 'Suppliers',
                component: () => import('@/components/SuppliersPage/index.vue'),
                meta: { breadcrumb: 'Suppliers', title: 'Suppliers', requiresAuth: true }
            },
            {
                path: 'item-repair',
                name: 'ItemRepair',
                component: () => import('@/components/ItemRepairPage/index.vue'),
                meta: { breadcrumb: 'Item Repair', title: 'Item Repair', requiresAuth: true }
            },
            {
                path: 'expenses',
                name: 'Expenses',
                component: () => import('@/components/ExpensesPage/index.vue'),
                meta: { breadcrumb: 'Expenses', title: 'Expenses', requiresAuth: true }
            },
            {
                path: 'reports',
                name: 'Reports',
                component: () => import('@/components/ReportsPage/index.vue'),
                meta: { breadcrumb: 'Reports', title: 'Reports', requiresAuth: true }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/components/UserProfile/index.vue'),
                meta: { breadcrumb: 'Profile', title: 'Profile', requiresAuth: true }
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Posinet POS';
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const userRole = store.getters.getRole;

    if (requiresAuth) {
        if (!store.getters.isLoggedIn) {
            next({ name: 'UserLogin' });
        } else if (to.meta.role && to.meta.role !== userRole) {
            // If the route requires a specific role and the user doesn't have it
            next({ name: userRole === 'admin' ? 'AdminDashboard' : 'Home' });
        } else {
            next();
        }
    } else {
        next();
    }
});

// Reload the current route to ensure proper evaluation
router.push({ name: router.currentRoute.value.name });

export default router;
