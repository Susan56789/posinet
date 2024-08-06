<template>
    <div class="profile-container">
        <div class="profile-header text-center p-6 bg-gray-800 border-b">
            <img :src="admin.profilePic || defaultProfilePic" alt="Profile Picture"
                class="h-24 w-24 rounded-full mx-auto" />
            <p class="pt-2 text-lg font-semibold text-gray-50">{{ admin.name }}</p>
            <p class="text-gray-400">{{ admin.email }}</p>
            <p class="text-gray-400">{{ admin.organization }}</p>
            <p class="text-gray-400">{{ admin.phone }}</p>
        </div>
        <div class="profile-form p-6">
            <form @submit.prevent="updateProfile">
                <div class="mb-4">
                    <label for="name" class="block text-gray-700">Name</label>
                    <input type="text" v-model="form.name" id="name" class="w-full mt-1 p-2 border rounded" />
                </div>
                <div class="mb-4">
                    <label for="email" class="block text-gray-700">Email</label>
                    <input type="email" v-model="form.email" id="email" class="w-full mt-1 p-2 border rounded" />
                </div>
                <div class="mb-4">
                    <label for="organization" class="block text-gray-700">Organization</label>
                    <input type="text" v-model="form.organization" id="organization"
                        class="w-full mt-1 p-2 border rounded" />
                </div>
                <div class="mb-4">
                    <label for="phone" class="block text-gray-700">Phone</label>
                    <input type="text" v-model="form.phone" id="phone" class="w-full mt-1 p-2 border rounded" />
                </div>
                <div class="mb-4">
                    <label for="profilePic" class="block text-gray-700">Profile Picture URL</label>
                    <input type="text" v-model="form.profilePic" id="profilePic"
                        class="w-full mt-1 p-2 border rounded" />
                </div>
                <button type="submit" class="bg-blue-500 text-white p-2 rounded">Update Profile</button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminProfile',
    data() {
        return {
            admin: {},
            form: {
                name: '',
                email: '',
                phone: '',
                organization: '',
                profilePic: ''
            },
            defaultProfilePic: '/assets/logo.png'
        };
    },
    methods: {
        async fetchAdminData() {
            try {
                const response = await fetch('https://posinet.onrender.com/api/admin/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                this.admin = data;
                this.form = { ...data };
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        },
        async updateProfile() {
            try {
                const response = await fetch('https://posinet.onrender.com/api/admin/update-profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(this.form)
                });
                const data = await response.json();
                if (response.ok) {
                    this.admin = { ...this.form };
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        }
    },
    created() {
        this.fetchAdminData();
    }
};
</script>

<style scoped>
.profile-container {
    max-width: 600px;
    margin: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.profile-header {
    background-color: #1a202c;
    color: white;
}

.profile-form {
    background-color: #f7fafc;
}

input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #cbd5e0;
}

button {
    background-color: #3182ce;
    color: white;
    padding: 10px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}
</style>
