<!-- SalesManagement.vue -->
<template>
    <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-4">Manage Sales</h2>

        <!-- Search and Add New Sale -->
        <div class="flex justify-between mb-4">
            <input v-model="searchQuery" @input="searchSales" type="text" placeholder="Search sales..."
                class="w-64 px-4 py-2 border rounded-lg" />
            <button @click="openNewSaleModal" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                Add New Sale
            </button>
        </div>

        <!-- Sales Table -->
        <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-gray-200">
                <tr>
                    <th class="px-4 py-2">ID</th>
                    <th class="px-4 py-2">Date</th>
                    <th class="px-4 py-2">Customer</th>
                    <th class="px-4 py-2">Total Amount</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sale in paginatedSales" :key="sale._id" class="border-b">
                    <td class="px-4 py-2">{{ sale._id }}</td>
                    <td class="px-4 py-2">{{ formatDate(sale.date) }}</td>
                    <td class="px-4 py-2">{{ sale.customerDetails.name }}</td>
                    <td class="px-4 py-2">${{ sale.totalAmount.toFixed(2) }}</td>
                    <td class="px-4 py-2">
                        <button @click="editSale(sale)"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2">
                            Edit
                        </button>
                        <button @click="deleteSale(sale._id)"
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

        <!-- Edit Sale Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-96">
                <h3 class="text-xl font-bold mb-4">{{ editingSale._id ? 'Edit' : 'Add' }} Sale</h3>
                <form @submit.prevent="saveSale">
                    <div class="mb-4">
                        <label class="block mb-2">Date</label>
                        <input v-model="editingSale.date" type="date" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Customer Name</label>
                        <input v-model="editingSale.customerDetails.name" type="text"
                            class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Total Amount</label>
                        <input v-model.number="editingSale.totalAmount" type="number" step="0.01"
                            class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <!-- Add more fields as needed -->
                    <div class="flex justify-end">
                        <button type="button" @click="showEditModal = false"
                            class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2">Cancel</button>
                        <button type="submit"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Save</button>
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
    name: 'SalesManagement',
    setup() {
        const sales = ref([]);
        const searchQuery = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 10;
        const showEditModal = ref(false);
        const editingSale = ref({
            customerDetails: {},
            products: []
        });

        const fetchSales = async () => {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/sales');
                sales.value = response.data;
            } catch (error) {
                console.error('Error fetching sales:', error);
            }
        };

        const searchSales = async () => {
            try {
                const response = await axios.get(`https://posinet.onrender.com/api/sales/search?query=${searchQuery.value}`);
                sales.value = response.data;
                currentPage.value = 1;
            } catch (error) {
                console.error('Error searching sales:', error);
            }
        };

        const paginatedSales = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return sales.value.slice(start, end);
        });

        const totalPages = computed(() =>
            Math.ceil(sales.value.length / itemsPerPage)
        );

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString();
        };

        const editSale = (sale) => {
            editingSale.value = { ...sale };
            showEditModal.value = true;
        };

        const saveSale = async () => {
            try {
                if (editingSale.value._id) {
                    await axios.put(`https://posinet.onrender.com/api/sales/${editingSale.value._id}`, editingSale.value);
                } else {
                    await axios.post('https://posinet.onrender.com/api/sales', editingSale.value);
                }
                await fetchSales();
                showEditModal.value = false;
            } catch (error) {
                console.error('Error saving sale:', error);
            }
        };

        const deleteSale = async (id) => {
            if (confirm('Are you sure you want to delete this sale?')) {
                try {
                    await axios.delete(`https://posinet.onrender.com/api/sales/${id}`);
                    await fetchSales();
                } catch (error) {
                    console.error('Error deleting sale:', error);
                }
            }
        };

        const openNewSaleModal = () => {
            editingSale.value = {
                date: new Date().toISOString().split('T')[0],
                customerDetails: { name: '' },
                totalAmount: 0,
                products: []
            };
            showEditModal.value = true;
        };

        onMounted(fetchSales);

        return {
            sales,
            searchQuery,
            currentPage,
            paginatedSales,
            totalPages,
            showEditModal,
            editingSale,
            searchSales,
            formatDate,
            editSale,
            saveSale,
            deleteSale,
            openNewSaleModal,
        };
    },
};
</script>