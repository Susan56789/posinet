<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-6 text-center">Item Repair Management</h1>

        <!-- Search and Add New Item -->
        <div class="flex flex-col md:flex-row justify-between mb-6">
            <div class="mb-4 md:mb-0 w-full md:w-1/2">
                <input v-model="searchQuery" @input="searchItems" type="text" placeholder="Search items..."
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
            </div>
            <div class="w-full md:w-auto">
                <button @click="showNewItemForm = !showNewItemForm"
                    class="w-full md:w-auto bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                    {{ showNewItemForm ? 'Cancel' : 'Add New Item' }}
                </button>
            </div>
        </div>

        <!-- Add New Item Form -->
        <div v-if="showNewItemForm" class="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Add New Repair Item</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="newItem.name" type="text" placeholder="Item name"
                    class="p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <input v-model="newItem.customerName" type="text" placeholder="Customer name"
                    class="p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <input v-model="newItem.customerPhone" type="text" placeholder="Customer phone"
                    class="p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <input v-model="newItem.customerEmail" type="email" placeholder="Customer email"
                    class="p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <input v-model="newItem.estimatedAmount" type="number" placeholder="Estimated amount"
                    class="p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
            </div>
            <div class="mt-4 text-right">
                <button @click="addItem"
                    class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200">
                    Submit New Item
                </button>
            </div>
        </div>

        <!-- Export to Excel Button -->
        <div class="text-right mb-6">
            <button @click="exportToExcel"
                class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200">
                Export to Excel
            </button>
        </div>

        <!-- Items List -->
        <div class="grid grid-cols-1 gap-4">
            <div v-for="item in paginatedItems" :key="item._id"
                class="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <input v-model="item.name" @blur="updateItem(item)"
                        class="text-lg font-semibold w-full md:w-1/3 mb-4 md:mb-0 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                    <select v-model="item.status" @change="updateItem(item)"
                        class="w-full md:w-1/5 mb-4 md:mb-0 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <input v-model="item.actualAmount" type="number" placeholder="Actual amount"
                        @blur="updateItem(item)"
                        class="w-full md:w-1/4 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                </div>
                <div class="text-sm text-gray-600 mt-2">
                    Created: {{ formatDate(item.dateCreated) }}
                    <span v-if="item.dateClosed">| Closed: {{ formatDate(item.dateClosed) }}</span>
                    | Estimated Amount: {{ formatCurrency(item.estimatedAmount) }}
                </div>
                <div class="text-sm text-gray-600">
                    Customer: {{ getCustomerName(item) }} | Phone: {{ getCustomerPhone(item) }} | Email: {{
                    getCustomerEmail(item) }}
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-blue-600 transition duration-200">
                Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-blue-600 transition duration-200">
                Next
            </button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';

export default {
    name: 'ItemRepairPage',
    data() {
        return {
            items: [],
            searchQuery: '',
            showNewItemForm: false,
            newItem: {
                name: '',
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                estimatedAmount: ''
            },
            currentPage: 1,
            itemsPerPage: 50,
        };
    },
    computed: {
        paginatedItems() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.items.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.items.length / this.itemsPerPage);
        },
    },
    mounted() {
        this.fetchItems();
    },
    methods: {
        formatCurrency(amount) {
            return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
        },
        getCustomerName(item) {
            return item.customerDetails?.name || 'N/A';
        },
        getCustomerPhone(item) {
            return item.customerDetails?.phone || 'N/A';
        },
        getCustomerEmail(item) {
            return item.customerDetails?.email || 'N/A';
        },
        async fetchItems() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://posinet.onrender.com/api/repairs', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.items = response.data;
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        },
        async searchItems() {
            try {
                const response = await axios.get(`https://posinet.onrender.com/api/repairs?search=${this.searchQuery}`);
                this.items = response.data;
                this.currentPage = 1;
            } catch (error) {
                console.error('Error searching items:', error);
            }
        },
        async addItem() {
            if (!this.newItem.name || !this.newItem.customerName || !this.newItem.estimatedAmount) {
                alert('Please fill in all required fields');
                return;
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Authentication token is missing.');
                    return;
                }

                // First, check if the customer exists
                const customerResponse = await axios.get(
                    `https://posinet.onrender.com/api/customers?search=${this.newItem.customerEmail}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                let customerId;
                if (customerResponse.data.length > 0) {
                    // Customer exists, use their ID
                    customerId = customerResponse.data[0]._id;
                } else {
                    // Customer doesn't exist, create a new one
                    const newCustomerResponse = await axios.post(
                        'https://posinet.onrender.com/api/customers',
                        {
                            name: this.newItem.customerName,
                            phone: this.newItem.customerPhone,
                            email: this.newItem.customerEmail
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    );
                    customerId = newCustomerResponse.data._id;
                }

                // Now create the repair item with the customer ID
                const response = await axios.post(
                    'https://posinet.onrender.com/api/repairs',
                    {
                        name: this.newItem.name,
                        customerId: customerId,
                        estimatedAmount: parseFloat(this.newItem.estimatedAmount)
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                this.items.unshift(response.data);
                this.newItem = { name: '', customerName: '', customerPhone: '', customerEmail: '', estimatedAmount: '' };
                this.showNewItemForm = false;
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Error adding item: ' + (error.response?.data?.message || error.message));
            }
        },
        async updateItem(item) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Authentication token is missing.');
                    return;
                }

                const response = await axios.put(
                    `https://posinet.onrender.com/api/repairs/${item._id}`,
                    {
                        name: item.name,
                        status: item.status,
                        actualAmount: item.actualAmount
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                Object.assign(item, response.data);
            } catch (error) {
                console.error('Error updating item:', error);
                alert('Error updating item: ' + (error.response?.data?.message || error.message));
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        exportToExcel() {
            const data = this.items.map(item => ({
                Name: item.name,
                Status: item.status,
                'Estimated Amount': this.formatCurrency(item.estimatedAmount),
                'Actual Amount': item.actualAmount ? this.formatCurrency(item.actualAmount) : 'N/A',
                'Customer Name': item.customerDetails.name,
                'Customer Phone': item.customerDetails.phone,
                'Customer Email': item.customerDetails.email,
                Created: this.formatDate(item.dateCreated),
                Closed: item.dateClosed ? this.formatDate(item.dateClosed) : 'N/A'
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Repair Items');
            XLSX.writeFile(wb, 'repair_items.xlsx');
        },
    },
};
</script>
