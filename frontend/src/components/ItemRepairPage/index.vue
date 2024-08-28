<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Item Repair</h1>
        <div class="flex justify-between mb-4">
            <!-- Search Bar -->
            <div class="mb-4">
                <input v-model="searchQuery" @input="searchItems" type="text" placeholder="Search items..."
                    class="w-full p-2 border rounded">
            </div>

            <!-- Add New Item Button -->
            <div class="mb-4">
                <button @click="showNewItemForm = !showNewItemForm" class="bg-blue-500 text-white px-4 py-2 rounded">
                    {{ showNewItemForm ? 'Cancel' : 'Add New Item' }}
                </button>
            </div>

        </div>

        <!-- Add New Item Form (Collapsible) -->
        <div v-if="showNewItemForm" class="mb-4 space-y-2 bg-gray-100 p-4 rounded">
            <input v-model="newItem.name" type="text" placeholder="Item name" class="w-full p-2 border rounded">
            <input v-model="newItem.customerName" type="text" placeholder="Customer name"
                class="w-full p-2 border rounded">
            <input v-model="newItem.customerPhone" type="text" placeholder="Customer phone"
                class="w-full p-2 border rounded">
            <input v-model="newItem.customerEmail" type="email" placeholder="Customer email"
                class="w-full p-2 border rounded">
            <input v-model="newItem.estimatedAmount" type="number" placeholder="Estimated amount"
                class="w-full p-2 border rounded">
            <button @click="addItem" class="bg-green-500 text-white px-4 py-2 rounded">
                Submit New Item
            </button>
        </div>

        <!-- Export to Excel Button -->
        <div class="mb-4">
            <button @click="exportToExcel" class="bg-green-500 text-white px-4 py-2 rounded">
                Export to Excel
            </button>
        </div>

        <!-- Items List -->
        <div class="space-y-4">
            <div v-for="item in paginatedItems" :key="item._id" class="border p-4 rounded">
                <div class="flex justify-between items-center">
                    <input v-model="item.name" @blur="updateItem(item)" class="text-lg font-semibold w-1/3">
                    <select v-model="item.status" @change="updateItem(item)" class="p-2 border rounded">
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <input v-model="item.actualAmount" type="number" placeholder="Actual amount"
                        @blur="updateItem(item)" class="p-2 border rounded w-1/4">
                </div>
                <div class="text-sm text-gray-600">
                    Created: {{ formatDate(item.dateCreated) }}
                    <span v-if="item.dateClosed">
                        | Closed: {{ formatDate(item.dateClosed) }}
                    </span>
                    | Estimated Amount: ${{ item.estimatedAmount }}
                </div>
                <div class="text-sm text-gray-600">
                    Customer: {{ item.customerName }} | Phone: {{ item.customerPhone }} | Email: {{ item.customerEmail
                    }}
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between items-center">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
                Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
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
        async fetchItems() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/repairs');
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
                const response = await axios.post('https://posinet.onrender.com/api/repairs', {
                    name: this.newItem.name,
                    customerDetails: {
                        name: this.newItem.customerName,
                        phone: this.newItem.customerPhone,
                        email: this.newItem.customerEmail
                    },
                    estimatedAmount: parseFloat(this.newItem.estimatedAmount)
                });
                this.items.unshift(response.data);
                this.newItem = { name: '', customerName: '', customerPhone: '', customerEmail: '', estimatedAmount: '' };
                this.showNewItemForm = false;
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Error adding item: ' + error.response.data.message);
            }
        },
        async updateItem(item) {
            try {
                const response = await axios.put(`https://posinet.onrender.com/api/repairs/${item._id}`, {
                    name: item.name,
                    status: item.status,
                    actualAmount: item.actualAmount
                });
                Object.assign(item, response.data);
            } catch (error) {
                console.error('Error updating item:', error);
                alert('Error updating item: ' + error.response.data.message);
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
                'Estimated Amount': item.estimatedAmount,
                'Actual Amount': item.actualAmount || 'N/A',
                'Customer Name': item.customerName,
                'Customer Phone': item.customerPhone,
                'Customer Email': item.customerEmail,
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