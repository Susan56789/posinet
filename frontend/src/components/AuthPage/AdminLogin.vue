<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">
                {{ currentForm === 'login' ? 'Admin Login' : 'Reset Password' }}
            </h1>

            <!-- Login Form -->
            <form @submit.prevent="login" class="space-y-4" v-if="currentForm === 'login'">
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

            <!-- Forgot Password Form -->
            <form @submit.prevent="resetPassword" class="space-y-4" v-if="currentForm === 'forgotPassword'">
                <input v-model.trim="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="nationalId" type="text" placeholder="National ID"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="newPassword" type="password" placeholder="New Password"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="confirmPassword" type="password" placeholder="Confirm New Password"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit"
                    class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Reset Password
                </button>
            </form>

            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>

            <button @click="toggleForm"
                class="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                {{ currentForm === 'login' ? 'Forgot Password?' : 'Back to Login' }}
            </button>
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
            currentForm: 'login',
            nationalId: '',
            newPassword: '',
            confirmPassword: ''
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
        },
        toggleForm() {
            this.currentForm = this.currentForm === 'login' ? 'forgotPassword' : 'login';
            this.error = '';
            this.clearFields();
        },
        clearFields() {
            this.email = '';
            this.password = '';
            this.nationalId = '';
            this.newPassword = '';
            this.confirmPassword = '';
        },
        async login() {
            this.error = '';
            try {
                const res = await axios.post('https://posinet.onrender.com/api/admin/login', {
                    email: this.email,
                    password: this.password
                });

                localStorage.setItem('token', res.data.token);

                this.$router.push('/admin');
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
                console.error('Login error:', error);
            }
        },
        async resetPassword() {
            this.error = '';
            if (this.newPassword !== this.confirmPassword) {
                this.error = "New passwords don't match";
                return;
            }
            try {
                await axios.post('https://posinet.onrender.com/api/admin/reset-password', {
                    email: this.email,
                    nationalId: this.nationalId,
                    newPassword: this.newPassword
                });
                alert('Password reset successfully');
                this.currentForm = 'login';
                this.clearFields();
            } catch (error) {
                this.error = error.response?.data?.message || 'Password reset failed. Please try again.';
                console.error('Password reset error:', error);
            }
        }
    }
};
</script>