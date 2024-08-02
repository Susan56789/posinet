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
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.09.328-.196.649-.316.958M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <svg v-else class="h-5 w-5 text-gray-500" fill="none" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13.875 18.825A10.029 10.029 0 0112 19c-4.478 0-8.268-2.943-9.542-7A9.972 9.972 0 014.344 6.344M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5.636 5.636l12.728 12.728" />
                        </svg>
                    </button>
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Login
                </button>
            </form>
            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
            <button @click="showChangePasswordForm = true"
                class="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                Change Password
            </button>

            <!-- Change Password Form -->
            <div v-if="showChangePasswordForm" class="mt-6">
                <h2 class="text-xl font-bold mb-4">Change Password</h2>
                <form @submit.prevent="changePassword" class="space-y-4">
                    <input v-model="nationalId" type="text" placeholder="National ID"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input v-model="newPassword" type="password" placeholder="New Password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input v-model="confirmPassword" type="password" placeholder="Confirm New Password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit"
                        class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                        Change Password
                    </button>
                </form>
            </div>
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
            passwordFieldType: 'password',
            showChangePasswordForm: false,
            nationalId: '',
            newPassword: '',
            confirmPassword: ''
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
        },
        async login() {
            this.error = ''; // Reset error message
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
                if (error.response && error.response.data) {
                    this.error = error.response.data;
                } else {
                    this.error = 'Login failed. Please check your credentials and try again.';
                }
                console.error('Login error:', error);
            }
        },
        async changePassword() {
            this.error = ''; // Reset error message
            if (this.newPassword !== this.confirmPassword) {
                this.error = "New passwords don't match";
                return;
            }
            try {
                const token = localStorage.getItem('token');
                await axios.post('https://posinet.onrender.com/admin/change-password', {
                    nationalId: this.nationalId,
                    newPassword: this.newPassword
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Password changed successfully');
                this.showChangePasswordForm = false;
                this.nationalId = '';
                this.newPassword = '';
                this.confirmPassword = '';
            } catch (error) {
                if (error.response && error.response.data) {
                    this.error = error.response.data;
                } else {
                    this.error = 'Password change failed. Please try again.';
                }
                console.error('Password change error:', error);
            }
        }
    }
};
</script>

<style>
/* Add any additional custom styles here if necessary */
</style>
