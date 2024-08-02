<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Reset Password</h1>
            <form @submit.prevent="resetPassword" class="space-y-4">
                <input v-model="email" type="email" placeholder="Email"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="newPassword" type="password" placeholder="New Password"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Reset Password
                </button>
            </form>
            <p v-if="message" class="text-green-500 text-center mt-4">{{ message }}</p>
            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ForgotPassword',
    data() {
        return {
            email: '',
            newPassword: '',
            message: '',
            error: ''
        };
    },
    methods: {
        async resetPassword() {
            try {
                const res = await axios.post('https://posinet.onrender.com/api/users/reset-password', {
                    email: this.email,
                    newPassword: this.newPassword
                });
                this.message = res.data.message;
                this.error = '';
            } catch (error) {
                if (error.response) {
                    this.error = error.response.data || 'Password reset failed';
                } else {
                    this.error = 'An error occurred';
                }
                this.message = '';
                console.error('Password reset error:', error);
            }
        }
    }
};
</script>

<style>
/* Add any additional custom styles here if necessary */
</style>
