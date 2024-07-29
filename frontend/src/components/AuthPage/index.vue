<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>
            <form @submit.prevent="login" class="space-y-4">
                <input v-model="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="password" type="password" placeholder="Password"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Login
                </button>
            </form>
            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AuthPage',
    data() {
        return {
            email: '',
            password: '',
            error: ''
        };
    },
    methods: {
        async login() {
            try {
                const res = await axios.post('https://posinet.onrender.com/login', {
                    email: this.email,
                    password: this.password
                });
                localStorage.setItem('token', res.data.token);
                this.$router.push('/admin');
            } catch (error) {
                this.error = 'Invalid credentials';
            }
        }
    }
};
</script>

<style>
/* Add any additional custom styles here if necessary */
</style>
