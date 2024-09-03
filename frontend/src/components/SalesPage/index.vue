<template>
    <div class="flex flex-col md:flex-row">
        <!-- Left Sidebar: Latest Products and Search Bar -->
        <div class="w-full md:w-1/3 p-4 md:p-6 bg-gray-100 border-b md:border-b-0 md:border-r">
            <!-- Search Bar -->
            <div class="mb-6 relative">
                <h2 class="text-xl font-semibold mb-2">Search Product</h2>
                <input v-model="searchQuery" @input="searchProduct" placeholder="Search Product"
                    class="w-full p-2 border rounded" />

                <!-- Dropdown for Search Results -->
                <ul v-if="filteredSearchResults.length"
                    class="absolute left-0 right-0 bg-white border rounded mt-2 z-10">
                    <li v-for="result in filteredSearchResults" :key="result._id"
                        class="p-2 hover:bg-gray-200 cursor-pointer">
                        <div class="flex justify-between items-center" @click="addProductToSale(result)">
                            <div v-if="result.stock > 0">
                                <p>{{ result.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatCurrency(result.price) }}</p>
                                <p class="text-xs text-green-600">In Stock: {{ result.stock }}</p>
                            </div>
                            <div v-else>
                                <p>{{ result.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatCurrency(result.price) }}</p>
                                <p class="text-xs text-red-600">Out of Stock</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Latest Products List -->
            <h2 class="text-xl font-semibold mb-4">Latest Products</h2>
            <ul class="space-y-2">
                <li v-for="product in latestProducts" :key="product._id" class="bg-white p-4 rounded shadow">
                    <div class="flex justify-between items-center">
                        <div>
                            <p>{{ product.title }}</p>
                            <p class="text-sm text-gray-600">{{ formatCurrency(product.price) }}</p>
                            <p v-if="product.stock > 0" class="text-xs text-green-600">In Stock: {{ product.stock }}</p>
                            <p v-else class="text-xs text-red-600">Out of Stock</p>
                        </div>
                        <div v-if="product.stock > 0" class="flex items-center">
                            <button @click="decreaseQuantity(product)"
                                class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                :disabled="!product.selectedQuantity || product.selectedQuantity === 0">
                                -
                            </button>
                            <span class="mx-2">{{ product.selectedQuantity || 0 }}</span>
                            <button @click="increaseQuantity(product)"
                                class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                                +
                            </button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Main Content: Sell Product Form -->
        <div class="w-full md:w-2/3 p-4 md:p-6 flex flex-col justify-between">
            <div>
                <h1 class="text-2xl font-bold mb-6">Sell Product</h1>
                <form @submit.prevent="sellProduct">
                    <!-- Display Selected Products -->
                    <div v-if="selectedProducts.length > 0" class="mb-4">
                        <label class="block text-gray-700 mb-2">Selected Products</label>
                        <table class="w-full mb-4">
                            <thead>
                                <tr>
                                    <th class="text-left p-2 border-b">Item</th>
                                    <th class="text-right p-2 border-b">Price</th>
                                    <th class="text-right p-2 border-b">Quantity</th>
                                    <th class="text-right p-2 border-b">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(product, index) in selectedProducts" :key="index">
                                    <td class="p-2 border-b">{{ product.title }}</td>
                                    <td class="p-2 border-b text-right">{{ formatCurrency(product.price) }}</td>
                                    <td class="p-2 border-b text-right">
                                        <div class="flex justify-end items-center">
                                            <button @click.prevent="decreaseQuantity(product)"
                                                class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                                                -
                                            </button>
                                            <input v-model.number="product.selectedQuantity" type="number"
                                                class="w-12 text-center p-2 border mx-2 rounded" />
                                            <button @click.prevent="increaseQuantity(product)"
                                                class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td class="p-2 border-b text-right">{{ formatCurrency(product.price *
                    product.selectedQuantity) }}</td>
                                </tr>
                            </tbody>
                            <!-- Total Row -->
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="p-2 border-t text-right font-semibold">Subtotal</td>
                                    <td class="p-2 border-t text-right">{{ formatCurrency(subTotal) }}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="p-2 border-t text-right font-semibold">Discount</td>
                                    <td class="p-2 border-t text-right">- {{ formatCurrency(discount) }}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="p-2 border-t text-right font-semibold">Total</td>
                                    <td class="p-2 border-t text-right">{{ formatCurrency(totalAmount) }}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <!-- Discount Input -->
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Discount</label>
                        <input v-model.number="discount" placeholder="Discount Amount (Max 500)"
                            class="w-full p-3 border rounded" type="number" min="0" max="500" />
                    </div>

                    <!-- Customer Details Inputs -->
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Customer Name</label>
                        <input v-model="customerDetails.name" placeholder="Customer Name"
                            class="w-full p-3 border rounded" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Phone Number</label>
                        <input v-model="customerDetails.phone" placeholder="Phone Number"
                            class="w-full p-3 border rounded" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Email</label>
                        <input v-model="customerDetails.email" placeholder="Email" type="email"
                            class="w-full p-3 border rounded" />
                    </div>

                    <!-- Payment Method Dropdown -->
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">Payment Method</label>
                        <select v-model="paymentMethod" class="w-full p-3 border rounded">
                            <option value="cash">Cash</option>
                            <option value="mpesa">Mpesa</option>
                            <option value="bank">Bank</option>
                        </select>
                    </div>

                    <!-- Complete Sale Button -->
                    <button @click="sellProduct"
                        class="w-full bg-blue-500 text-white py-3 mt-4 rounded hover:bg-blue-600">
                        Complete Sale
                    </button>
                </form>
            </div>

            <!-- Error Display -->
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { useStore } from 'vuex';
import { computed } from 'vue';

export default {
    name: "SalesPage",
    setup() {
        const store = useStore();
        const userName = computed(() => store.getters.getUserName);

        return {
            userName
        };
    },
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            selectedProducts: [],
            discount: 0,
            customerDetails: {
                name: '',
                phone: '',
                email: ''
            },
            paymentMethod: 'cash',
            error: '',
            latestProducts: [],
            subTotal: 0,
            totalAmount: 0
        };
    },
    created() {
        this.fetchLatestProducts();
    },
    methods: {
        async fetchLatestProducts() {
            try {
                const res = await axios.get('https://posinet.onrender.com/api/products/latest');
                this.latestProducts = res.data.map(product => ({
                    ...product,
                    selectedQuantity: 0,
                    price: product.salePrice
                }));
            } catch (error) {
                console.error('Error fetching latest products:', error);
                this.error = 'Error fetching latest products: ' + error.message;
            }
        },
        async searchProduct() {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };
                const response = await axios.post('https://posinet.onrender.com/api/products/search', {
                    query: this.searchQuery
                }, { headers });

                // Ensure response.data.products is defined and is an array
                if (response.data && Array.isArray(response.data.products)) {
                    this.searchResults = response.data.products.map(product => ({
                        ...product,
                        selectedQuantity: 0,
                        price: product.salePrice
                    }));
                } else {
                    // Handle the case where products is not defined or is not an array
                    this.searchResults = [];
                    console.error('Unexpected response structure:', response.data);
                }
            } catch (error) {
                console.error('Error searching products:', error);
                this.error = 'Error searching products: ' + error.message;
            }
        },
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },
        addProductToSale(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct) {
                existingProduct.selectedQuantity++;
            } else {
                product.selectedQuantity = 1;
                this.selectedProducts.push(product);
            }
            this.calculateTotals();
        },
        increaseQuantity(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct) {
                if (existingProduct.selectedQuantity < product.stock) {
                    existingProduct.selectedQuantity++;
                }
            } else {
                product.selectedQuantity = 1;
                this.selectedProducts.push(product);
            }
            this.calculateTotals();
        },
        decreaseQuantity(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct && existingProduct.selectedQuantity > 1) {
                existingProduct.selectedQuantity--;
            } else if (existingProduct && existingProduct.selectedQuantity === 1) {
                this.selectedProducts = this.selectedProducts.filter(p => p._id !== product._id);
            }
            this.calculateTotals();
        },
        clearForm() {
            // Reset form
            this.selectedProducts = [];
            this.discount = 0;
            this.customerDetails = { name: '', phone: '', email: '' };
            this.paymentMethod = 'cash';
            this.calculateTotals();
        },
        calculateTotals() {
            this.subTotal = this.selectedProducts.reduce((total, product) => total + product.price * product.selectedQuantity, 0);
            this.totalAmount = this.subTotal - this.discount;
        },
        async sellProduct() {
            if (!this.customerDetails.name || !this.customerDetails.phone || !this.customerDetails.email) {
                this.error = 'Please fill out all customer details.';
                return;
            }
            if (this.discount > 500) {
                this.error = 'Discount cannot exceed 500 KES.';
                return;
            }
            const payload = {
                customerDetails: this.customerDetails,
                products: this.selectedProducts.map(p => ({
                    productId: p._id,
                    quantity: p.selectedQuantity,
                    price: p.price
                })),
                totalAmount: this.totalAmount,
                discount: this.discount,
                paymentMethod: this.paymentMethod,
                date: new Date().toISOString(),
                servedBy: this.userName
            };

            try {
                const token = localStorage.getItem('token');
                const saleResponse = await axios.post('https://posinet.onrender.com/api/sales', payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };
                await axios.post('https://posinet.onrender.com/api/sales', payload, { headers });
                this.error = '';

                this.clearForm();
                this.$router.push({ name: 'ReceiptPage', params: { saleId: saleResponse.data.saleId } });


            } catch (error) {
                console.error('Error completing sale:', error);
                this.error = 'An error occurred while completing the sale.';
            }
        },
    },
    computed: {
        filteredSearchResults() {
            return this.searchResults.filter(product =>
                product.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
    },
    watch: {
        discount() {
            if (this.discount > 500) {
                this.discount = 500;
            }
            this.calculateTotals();
        },
        selectedProducts: {
            handler() {
                this.calculateTotals();
            },
            deep: true
        }
    }
};
</script>

<style scoped></style>
