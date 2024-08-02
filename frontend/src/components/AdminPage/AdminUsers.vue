<template>
    <div class="manage-users  min-h-screen">
        <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
        <button @click="openAddUserModal" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">
            Add User
        </button>
        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Name</th>
                    <th class="py-2 px-4">Email</th>
                    <th class="py-2 px-4">Role</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user._id" class="border-b">
                    <td class="py-2 px-4">{{ user.name }}</td>
                    <td class="py-2 px-4">{{ user.email }}</td>
                    <td class="py-2 px-4">{{ user.role }}</td>
                    <td class="py-2 px-4">
                        <button @click="openEditUserModal(user)"
                            class="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600">Edit</button>
                        <button @click="deleteUser(user._id)"
                            class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Add User Modal -->
        <div v-if="showAddUserModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <h2 class="text-xl font-bold mb-4">Add User</h2>
                <form @submit.prevent="addUser">
                    <div class="mb-4">
                        <label class="block text-gray-700">Name</label>
                        <input type="text" v-model="newUser.name" class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Email</label>
                        <input type="email" v-model="newUser.email" class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Password</label>
                        <input type="password" v-model="newUser.password"
                            class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Phone</label>
                        <input type="text" v-model="newUser.phone" class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeAddUserModal"
                            class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2">Cancel</button>
                        <button type="submit"
                            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditUserModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <h2 class="text-xl font-bold mb-4">Edit User</h2>
                <form @submit.prevent="updateUser">
                    <div class="mb-4">
                        <label class="block text-gray-700">Name</label>
                        <input type="text" v-model="currentUser.name" class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Email</label>
                        <input type="email" v-model="currentUser.email"
                            class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Role</label>
                        <input type="text" v-model="currentUser.role" class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700">Phone</label>
                        <input type="text" v-model="currentUser.phone"
                            class="w-full border border-gray-300 p-2 rounded">
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeEditUserModal"
                            class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2">Cancel</button>
                        <button type="submit"
                            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Update</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AdminUsers',
    data() {
        return {
            users: [],
            showAddUserModal: false,
            showEditUserModal: false,
            newUser: {
                name: '',
                email: '',
                password: '',
                phone: ''
            },
            currentUser: null
        };
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/users');
                this.users = response.data;
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        },
        openAddUserModal() {
            this.newUser = { name: '', email: '', password: '', phone: '' };
            this.showAddUserModal = true;
        },
        closeAddUserModal() {
            this.showAddUserModal = false;
        },
        async addUser() {
            try {
                await axios.post('https://posinet.onrender.com/api/users/register', this.newUser);
                this.fetchUsers();
                this.closeAddUserModal();
            } catch (error) {
                console.error('Error adding user:', error);
            }
        },
        openEditUserModal(user) {
            this.currentUser = { ...user };
            this.showEditUserModal = true;
        },
        closeEditUserModal() {
            this.showEditUserModal = false;
        },
        async updateUser() {
            try {
                await axios.put(`https://posinet.onrender.com/api/users/${this.currentUser._id}`, this.currentUser);
                this.fetchUsers();
                this.closeEditUserModal();
            } catch (error) {
                console.error('Error updating user:', error);
            }
        },
        async deleteUser(userId) {
            try {
                await axios.delete(`https://posinet.onrender.com/api/users/${userId}`);
                this.fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    },
    mounted() {
        this.fetchUsers();
    }
}
</script>

<style scoped>
.manage-users {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
</style>
