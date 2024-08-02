<template>
    <header class="bg-blue-500 text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">Posinet POS</h1>
            <div v-if="isLoggedIn" class="flex items-center space-x-4">
                <router-link :to="{ name: 'Profile' }" class="hover:underline">
                    Welcome, {{ userName }}
                </router-link>
                <span>{{ currentDate }}</span>
                <button @click="logout"
                    class="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-colors">
                    Logout
                </button>
            </div>
        </div>
    </header>
</template>

<script>
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';

export default {
    name: 'HeaderPage',
    setup() {
        const router = useRouter();
        const currentDate = ref(new Date().toLocaleDateString());

        let isLoggedIn = computed(() => !!localStorage.getItem('token'));
        const userName = computed(() => localStorage.getItem('userName') || 'User');

        const logout = () => {
            // Clear all authentication-related data
            localStorage.removeItem('token');
            localStorage.removeItem('userName');

            // Clear any other auth-related data if necessary
            // For example, if you're using Vuex for state management:
            // store.dispatch('auth/logout');
            isLoggedIn = false;
            // Redirect to the user login page
            router.push({ name: 'UserLogin' });
        };

        return {
            isLoggedIn,
            userName,
            currentDate,
            logout
        };
    }
};
</script>