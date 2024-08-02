<template>
    <div class="container mx-auto mt-8 p-4">
        <h1 class="text-2xl font-bold mb-6">User Profile</h1>
        <div class="max-w-md mx-auto bg-white p-8 rounded shadow-md">
            <h2 class="text-xl font-semibold mb-4">Update Password</h2>
            <form @submit.prevent="updatePassword" class="space-y-4">
                <div>
                    <label for="currentPassword" class="block mb-1">Current Password</label>
                    <input id="currentPassword" v-model="currentPassword" type="password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="newPassword" class="block mb-1">New Password</label>
                    <input id="newPassword" v-model="newPassword" type="password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="confirmPassword" class="block mb-1">Confirm New Password</label>
                    <input id="confirmPassword" v-model="confirmPassword" type="password"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    :disabled="isLoading">
                    {{ isLoading ? 'Updating...' : 'Update Password' }}
                </button>
            </form>
            <p v-if="message"
                :class="['mt-4 text-center', message.type === 'error' ? 'text-red-500' : 'text-green-500']">
                {{ message.text }}
            </p>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
    name: 'UserProfile',
    setup() {
        const currentPassword = ref('');
        const newPassword = ref('');
        const confirmPassword = ref('');
        const isLoading = ref(false);
        const message = ref(null);

        const updatePassword = async () => {
            if (newPassword.value !== confirmPassword.value) {
                message.value = { type: 'error', text: 'New passwords do not match.' };
                return;
            }

            isLoading.value = true;
            message.value = null;

            try {
                await axios.post('https://posinet.onrender.com/api/users/update-password', {
                    currentPassword: currentPassword.value,
                    newPassword: newPassword.value,
                });
                message.value = { type: 'success', text: 'Password updated successfully.' };
                currentPassword.value = '';
                newPassword.value = '';
                confirmPassword.value = '';
            } catch (error) {
                message.value = { type: 'error', text: error.response?.data?.message || 'Failed to update password. Please try again.' };
            } finally {
                isLoading.value = false;
            }
        };

        return {
            currentPassword,
            newPassword,
            confirmPassword,
            isLoading,
            message,
            updatePassword
        };
    }
};
</script>