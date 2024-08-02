<template>
    <div class="manage-permissions">
        <h1 class="text-2xl font-bold mb-4">Manage Permissions</h1>
        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Role</th>
                    <th class="py-2 px-4">Permissions</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="role in roles" :key="role._id" class="border-b">
                    <td class="py-2 px-4">{{ role.name }}</td>
                    <td class="py-2 px-4">{{ role.permissions.join(', ') }}</td>
                    <td class="py-2 px-4">
                        <button @click="editRole(role)"
                            class="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600">Edit</button>
                        <button @click="deleteRole(role._id)"
                            class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'AdminPermissions',
    data() {
        return {
            roles: []
        };
    },
    methods: {
        fetchRoles() {
            // Fetch roles from the backend
        },
        editRole(role) {
            // Edit role logic
            console.log(role)
        },
        deleteRole(roleId) {
            // Delete role logic
            console.log(roleId)
        }
    },
    mounted() {
        this.fetchRoles();
    }
}
</script>