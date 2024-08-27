<template>
    <div class="inventory-page">
        <h1 class="text-2xl font-bold mb-4">Inventory</h1>

        <!-- Search and Export -->
        <div class="mb-4 flex justify-between">
            <input v-model="searchQuery" @input="search" placeholder="Search products..." class="p-2 border rounded" />
            <button @click="exportToExcel" class="bg-green-500 text-white px-4 py-2 rounded">
                Export to Excel
            </button>
        </div>

        <!-- Products Table -->
        <table class="w-full bg-white shadow-md rounded mb-4">
            <thead>
                <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Image</th>
                    <th class="py-3 px-6 text-left">Title</th>
                    <th class="py-3 px-6 text-left">Category</th>
                    <th class="py-3 px-6 text-right">Price</th>
                    <th class="py-3 px-6 text-right">Discounted Price</th>
                    <th class="py-3 px-6 text-right">Stock</th>
                </tr>
            </thead>
            <tbody class="text-gray-600 text-sm font-light">
                <tr v-for="product in paginatedProducts" :key="product._id"
                    class="border-b border-gray-200 hover:bg-gray-100">
                    <td class="py-3 px-6 text-left whitespace-nowrap">
                        <img v-if="product.imageUrl" :src="product.imageUrl" alt="Product image"
                            class="w-12 h-12 object-cover rounded" />
                        <span v-else>No image</span>
                    </td>
                    <td class="py-3 px-6 text-left">{{ product.title }}</td>
                    <td class="py-3 px-6 text-left">{{ product.category }}</td>
                    <td class="py-3 px-6 text-right">{{ formatCurrency(product.price) }}</td>
                    <td class="py-3 px-6 text-right">{{ product.discountedPrice ?
                formatCurrency(product.discountedPrice) : '-' }}</td>
                    <td class="py-3 px-6 text-right">{{ product.stock }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center">
            <button @click="previousPage" :disabled="currentPage === 1"
                class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
                Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
                Next
            </button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';

export default {
    name: 'InventoryPage',
    data() {
        return {
            allProducts: [],
            filteredProducts: [],
            currentPage: 1,
            productsPerPage: 50,
            searchQuery: '',
        }
    },
    computed: {
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.productsPerPage;
            const end = start + this.productsPerPage;
            return this.filteredProducts.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredProducts.length / this.productsPerPage);
        }
    },
    methods: {
        async fetchProducts() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/products');
                this.allProducts = response.data.map(product => ({
                    ...product,
                    imageUrl: product.images && product.images.length > 0
                        ? `data:${product.images[0].contentType};base64,${product.images[0].data}`
                        : null
                }));
                this.filteredProducts = [...this.allProducts];
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },
        formatCurrency(value) {
            return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        search() {
            this.currentPage = 1;
            const query = this.searchQuery.toLowerCase();
            this.filteredProducts = this.allProducts.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        },
        exportToExcel() {
            const data = this.filteredProducts.map(product => ({
                Title: product.title,
                Category: product.category,
                Price: product.price,
                'Discounted Price': product.discountedPrice || '',
                Stock: product.stock
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
            XLSX.writeFile(workbook, "inventory.xlsx");
        }
    },
    mounted() {
        this.fetchProducts();
    }
}
</script>

<style scoped>
.inventory-page {
    padding: 20px;
}
</style>