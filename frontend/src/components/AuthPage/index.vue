<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">User Login</h1>
            <form @submit.prevent="login" class="space-y-4">
                <input v-model.trim="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div class="relative">
                    <input :type="passwordFieldType" v-model="password" placeholder="Password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" @click="togglePasswordVisibility"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <!-- SVG icons remain unchanged -->
                    </button>
                </div>
                <button type="submit" :disabled="isLoading"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                    {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
            </form>
            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
            <p class="text-center mt-4">
                <router-link to="/forgot-password" class="text-blue-500 hover:underline">Forgot Password?</router-link>
            </p>
        </div>
    </div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
    name: 'AuthPage',
    data() {
        return {
            email: '',
            password: '',
            error: '',
            passwordFieldType: 'password',
            isLoading: false
        };
    },
    methods: {
        ...mapActions(['loginUser']),
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
        },
        async login() {
            this.error = '';
            if (!this.validateForm()) return;

            this.isLoading = true;
            try {
                await this.loginUser({ email: this.email, password: this.password });
                this.$router.push('/sales');
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
                console.error('Login error:', error);
            } finally {
                this.isLoading = false;
            }
        },
        validateForm() {
            if (!this.email || !this.password) {
                this.error = 'Please enter both email and password.';
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(this.email)) {
                this.error = 'Please enter a valid email address.';
                return false;
            }
            return true;
        }
    }
};
</script>
