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

import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'HeaderPage',
    setup() {

        const store = useStore();
        const currentDate = ref(new Date().toLocaleDateString());

        const isLoggedIn = computed(() => store.getters.isLoggedIn);
        const userName = computed(() => store.getters.getUserName);

        const logout = () => {
            store.dispatch('autoLogout');
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
