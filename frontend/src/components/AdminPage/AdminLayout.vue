<template>
    <div class="admin-layout flex flex-col md:flex-row min-h-screen">
        <aside class="sidebar bg-gray-800 text-white w-full md:w-64 md:min-h-screen">
            <div class="sidebar-header p-4 bg-gray-900">
                <router-link to="/" class="logo text-xl font-bold">Posinet POS</router-link>
            </div>
            <nav class="menu p-4">
                <ul class="space-y-2">
                    <li v-for="(item, index) in menuItems" :key="index">
                        <router-link :to="item.path" class="block py-2 px-4 hover:bg-gray-700 rounded"
                            active-class="bg-gray-700">
                            {{ item.name }}
                        </router-link>
                    </li>
                </ul>
            </nav>
        </aside>
        <div class="main-content flex-1">
            <header class="bg-white shadow p-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-xl font-semibold">{{ $route.meta.title }}</h1>
                    <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        Logout
                    </button>
                </div>
            </header>
            <main class="p-4">
                <router-view></router-view>
            </main>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
    name: 'AdminLayout',
    setup() {
        const router = useRouter();
        const token = ref('');

        const menuItems = [
            { name: 'Dashboard', path: '/admin' },
            { name: 'Manage Users', path: '/admin/users' },
            { name: 'Manage Products', path: '/admin/products' },
            { name: 'Manage Permissions', path: '/admin/permissions' },
            { name: 'View Reports', path: '/admin/reports' },
        ];

        onMounted(() => {
            token.value = localStorage.getItem('token');
            if (token.value) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
            } else {
                router.push('/login/admin');
            }
        });

        const logout = () => {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            router.push('/login/admin');
        };

        return {
            menuItems,
            logout,
        };
    },
};
</script>