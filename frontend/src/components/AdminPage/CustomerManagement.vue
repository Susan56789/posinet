<template>
    <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-4">Manage Customers</h2>

        <!-- Search and Add New Customer -->
        <div class="flex justify-between mb-4">
            <input v-model="searchQuery" @input="searchCustomers" type="text" placeholder="Search customers..."
                class="w-64 px-4 py-2 border rounded-lg" />
            <button @click="openNewCustomerModal" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                Add New Customer
            </button>
        </div>

        <!-- Customers Table -->
        <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-gray-200">
                <tr>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Email</th>
                    <th class="px-4 py-2">Phone</th>
                    <th class="px-4 py-2">Total Purchases</th>
                    <th class="px-4 py-2">Credit Limit</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="customer in paginatedCustomers" :key="customer._id" class="border-b">
                    <td class="px-4 py-2">{{ customer.name }}</td>
                    <td class="px-4 py-2">{{ customer.email }}</td>
                    <td class="px-4 py-2">{{ customer.phone }}</td>
                    <td class="px-4 py-2">{{ formatCurrency(customer.totalPurchases) }}</td>
                    <td class="px-4 py-2">{{ formatCurrency(customer.creditLimit) }}</td>
                    <td class="px-4 py-2">
                        <button @click="editCustomer(customer)"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2">
                            Edit
                        </button>
                        <button @click="deleteCustomer(customer._id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex justify-center">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="[
                'mx-1 px-3 py-1 rounded',
                currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
            ]">
                {{ page }}
            </button>
        </div>

        <!-- Edit Customer Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-96">
                <h3 class="text-xl font-bold mb-4">{{ editingCustomer._id ? 'Edit' : 'Add' }} Customer</h3>
                <form @submit.prevent="saveCustomer">
                    <div class="mb-4">
                        <label class="block mb-2">Name</label>
                        <input v-model="editingCustomer.name" type="text" class="w-full px-3 py-2 border rounded"
                            required />
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Email</label>
                        <input v-model="editingCustomer.email" type="email" class="w-full px-3 py-2 border rounded"
                            required />
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Phone</label>
                        <input v-model="editingCustomer.phone" type="tel" class="w-full px-3 py-2 border rounded"
                            required />
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Credit Limit</label>
                        <input v-model.number="editingCustomer.creditLimit" type="number" step="0.01"
                            class="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="showEditModal = false"
                            class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2">
                            Cancel
                        </button>
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
    name: 'CustomerManagement',
    setup() {
        const customers = ref([]);
        const searchQuery = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 10;
        const showEditModal = ref(false);
        const editingCustomer = ref({});

        const fetchCustomers = async () => {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/customers');
                customers.value = response.data;
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };

        const searchCustomers = async () => {
            try {
                const response = await axios.get(
                    `https://posinet.onrender.com/api/customers/search?query=${searchQuery.value}`
                );
                customers.value = response.data;
                currentPage.value = 1;
            } catch (error) {
                console.error('Error searching customers:', error);
            }
        };

        const paginatedCustomers = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return customers.value.slice(start, start + itemsPerPage);
        });

        const totalPages = computed(() =>
            Math.ceil(customers.value.length / itemsPerPage)
        );

        const editCustomer = (customer) => {
            editingCustomer.value = { ...customer };
            showEditModal.value = true;
        };

        const formatCurrency = (value) => {
            const numericValue = parseFloat(value);
            return isNaN(numericValue)
                ? '-'
                : numericValue.toLocaleString('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                });
        };

        const saveCustomer = async () => {
            try {
                if (editingCustomer.value._id) {
                    await axios.put(
                        `https://posinet.onrender.com/api/customers/${editingCustomer.value._id}`,
                        editingCustomer.value
                    );
                } else {
                    await axios.post('https://posinet.onrender.com/api/customers', editingCustomer.value);
                }
                await fetchCustomers();
                showEditModal.value = false;
            } catch (error) {
                console.error('Error saving customer:', error);
            }
        };

        const deleteCustomer = async (id) => {
            if (confirm('Are you sure you want to delete this customer?')) {
                try {
                    await axios.delete(`https://posinet.onrender.com/api/customers/${id}`);
                    await fetchCustomers();
                } catch (error) {
                    console.error('Error deleting customer:', error);
                }
            }
        };

        const openNewCustomerModal = () => {
            editingCustomer.value = {
                name: '',
                email: '',
                phone: '',
                creditLimit: 0,
                totalPurchases: 0,
            };
            showEditModal.value = true;
        };

        onMounted(fetchCustomers);

        return {
            customers,
            searchQuery,
            currentPage,
            paginatedCustomers,
            totalPages,
            showEditModal,
            editingCustomer,
            searchCustomers,
            editCustomer,
            saveCustomer,
            deleteCustomer,
            openNewCustomerModal,
            formatCurrency,
        };
    },
};
</script>
