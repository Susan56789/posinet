<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            <form @submit.prevent="login" class="space-y-4">
                <input v-model="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div class="relative">
                    <input :type="passwordFieldType" v-model="password" placeholder="Password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" @click="togglePasswordVisibility"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <svg v-if="passwordFieldType === 'password'" class="h-5 w-5 text-gray-500" fill="none"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" stroke="currentColor">
                            <path
                                d="M2.94 8.94A8 8 0 0110 6a8 8 0 017.06 2.94M10 12a4 4 0 110-8 4 4 0 010 8zm0 0a4 4 0 110 8 4 4 0 010-8zM3 10a7 7 0 0014 0M2.94 11.06A8 8 0 0110 14a8 8 0 007.06-2.94" />
                        </svg>
                        <svg v-if="passwordFieldType === 'text'" class="h-5 w-5 text-gray-500" fill="none"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" stroke="currentColor">
                            <path
                                d="M13.875 18.825a7.952 7.952 0 01-3.875 1.075A8 8 0 010 10a8 8 0 0110-7.8M10 6a4 4 0 110 8 4 4 0 010-8zm0 8a4 4 0 110-8 4 4 0 010 8zM10 10a7 7 0 100-14 7 7 0 000 14z" />
                        </svg>
                    </button>
                </div>
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
    name: 'AdminLogin',
    data() {
        return {
            email: '',
            password: '',
            error: '',
            passwordFieldType: 'password'
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
        },
        async login() {
            try {
                const res = await axios.post('https://posinet.onrender.com/login/admin', {
                    email: this.email,
                    password: this.password
                });
                const { token, admin } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('role', admin.role);
                localStorage.setItem('userName', admin.name);
                localStorage.setItem('email', admin.email);

                this.$router.push('/admin');
            } catch (error) {
                if (error.response) {
                    this.error = error.response.data || 'Login failed';
                } else {
                    this.error = 'An error occurred';
                }
                console.error('Login error:', error);
            }
        }
    }
};
</script>

<style>
/* Add any additional custom styles here if necessary */
</style>
