<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Item Repair</h1>

        <!-- Search Bar -->
        <div class="mb-4">
            <input v-model="searchQuery" @input="searchItems" type="text" placeholder="Search items..."
                class="w-full p-2 border rounded">
        </div>

        <!-- Add New Item Form -->
        <div class="mb-4">
            <input v-model="newItemName" type="text" placeholder="New item name" class="w-full p-2 border rounded mb-2">
            <button @click="addItem" class="bg-blue-500 text-white px-4 py-2 rounded">
                Add New Item
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
                    <input v-model="item.name" @blur="updateItem(item)" class="text-lg font-semibold w-1/2">
                    <select v-model="item.status" @change="updateItem(item)" class="p-2 border rounded">
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
                <div class="text-sm text-gray-600">
                    Created: {{ formatDate(item.dateCreated) }}
                    <span v-if="item.dateClosed">
                        | Closed: {{ formatDate(item.dateClosed) }}
                    </span>
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
            newItemName: '',
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
            if (!this.newItemName) return;
            try {
                await axios.post('https://posinet.onrender.com/api/repairs', { name: this.newItemName });
                this.newItemName = '';
                await this.fetchItems();
            } catch (error) {
                console.error('Error adding item:', error);
            }
        },
        async updateItem(item) {
            try {
                await axios.put(`https://posinet.onrender.com/api/repairs/${item._id}`, item);
                await this.fetchItems();
            } catch (error) {
                console.error('Error updating item:', error);
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