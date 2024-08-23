<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Admin Login</h1>

            <form @submit.prevent="login" class="space-y-4">
                <input v-model.trim="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div class="relative">
                    <input :type="passwordFieldType" v-model="password" placeholder="Password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" @click="togglePasswordVisibility"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <!-- Eye icons remain unchanged -->
                    </button>
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Login
                </button>
            </form>

            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>

            <button @click="toggleForm"
                class="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                Forgot Password?
            </button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import store from '../../store/index';

export default {
    name: 'AdminLogin',
    data() {
        return {
            email: '',
            password: '',
            error: '',
            passwordFieldType: 'password',
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
        },
        async login() {
            this.error = '';
            try {
                const res = await axios.post('https://posinet.onrender.com/api/admin/login', {
                    email: this.email,
                    password: this.password,
                });

                const { token, userName, userId, role } = res.data;

                if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
                    throw new Error('Invalid token received from server');
                }

                // Save the token and user details in Vuex store
                await store.dispatch('login', { token, userName, userId, role });

                // Set the default Authorization header for future axios requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Redirect to the appropriate page based on the role
                if (role === 'admin') {
                    this.$router.push({ name: 'AdminDashboard' });
                } else {
                    this.$router.push({ name: 'Home' });
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
                console.error('Login error:', error);
            }
        },
    },
};
</script>
