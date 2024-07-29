<template>
    <div class="header flex justify-between items-center p-4 bg-gray-200">
        <div class="date-time">{{ currentDateTime }}</div>
        <div class="user-info flex items-center">
            <span class="mr-4 cursor-pointer" @click="goToProfile">{{ userName }}</span>
            <button @click="logout" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600">
                Logout
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            currentDateTime: new Date().toLocaleString(),
            userName: localStorage.getItem('userName') || 'User',
        };
    },
    mounted() {
        this.interval = setInterval(() => {
            this.currentDateTime = new Date().toLocaleString();
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.interval);
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('role');
            this.$router.push('/login');
        },
        goToProfile() {
            this.$router.push('/profile');
        }
    }
};
</script>

<style>
.header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
}
</style>