<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">User Profile</h1>
        <div>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <!-- Add other user details here -->
        </div>
        <h2 class="text-xl font-bold mt-6">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
            <input v-model="currentPassword" type="password" placeholder="Current Password"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input v-model="newPassword" type="password" placeholder="New Password"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                Change Password
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'UserProfile',
    data() {
        return {
            user: {
                email: localStorage.getItem('email') || 'user@example.com'
            },
            currentPassword: '',
            newPassword: '',
            error: ''
        };
    },
    methods: {
        async changePassword() {
            try {
                await axios.post('https://posinet.onrender.com/change-password', {
                    email: this.user.email,
                    currentPassword: this.currentPassword,
                    newPassword: this.newPassword
                });
                alert('Password changed successfully');
                this.currentPassword = '';
                this.newPassword = '';
            } catch (error) {
                this.error = error.response ? error.response.data : 'An error occurred';
            }
        }
    }
};
</script>