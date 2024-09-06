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
                            <!-- Update: Call addProductToSale when the plus button is clicked -->
                            <button @click="addProductToSale(product)"
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
            error: null,
            latestProducts: [],

        };
    },
    computed: {
        subTotal() {
            return this.selectedProducts.reduce((total, product) => {
                return total + (product.selectedQuantity * product.price);
            }, 0);
        },
        totalAmount() {
            return this.subTotal - this.discount;
        },
        filteredSearchResults() {
            if (!this.searchQuery) return [];
            return this.searchResults.filter(product =>
                product.title.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async fetchLatestProducts() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/products/latest');
                this.latestProducts = response.data;
            } catch (error) {
                this.error = 'Failed to fetch latest products';
            }
        },
        searchProduct() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authorization token is missing. Please log in again.');
            }

            if (this.searchQuery.length < 2) return;
            axios
                .get(`https://posinet.onrender.com/api/products/search?q=${this.searchQuery}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(response => {
                    this.searchResults = response.data;
                })
                .catch(error => {
                    console.error('Error searching for product:', error);
                    this.error = 'Error searching for product: ' + error.message;
                });
        },
        addProductToSale(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);

            if (existingProduct) {
                existingProduct.selectedQuantity++;
            } else {
                this.selectedProducts.push({ ...product, selectedQuantity: 1 });
            }
        },
        increaseQuantity(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct) {
                existingProduct.selectedQuantity++;
            }
        },
        decreaseQuantity(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct && existingProduct.selectedQuantity > 1) {
                existingProduct.selectedQuantity--;
            } else {
                this.selectedProducts = this.selectedProducts.filter(p => p._id !== product._id);
            }
        },
        formatCurrency(amount) {
            return `KES ${amount.toFixed(2)}`;
        },
        async sellProduct() {
            if (!this.selectedProducts.length) {
                this.error = 'No products selected for sale.';
                return;
            }

            const saleData = {
                products: this.selectedProducts.map(product => ({
                    productId: product._id,
                    quantity: product.selectedQuantity,
                    price: product.price,
                })),
                discount: this.discount || 0,
                customerDetails: {
                    name: this.customerDetails.name.trim(),
                    phone: this.customerDetails.phone.trim(),
                    email: this.customerDetails.email.trim() || null,
                },
                paymentMethod: this.paymentMethod,
                totalAmount: this.totalAmount,
                date: new Date().toISOString(),
                servedBy: this.userName,
            };

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authorization token is missing. Please log in again.');
                }

                const response = await axios.post('https://posinet.onrender.com/api/sales', saleData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.resetForm();
                alert('Sale successful!');
                this.$router.push({ name: 'ReceiptPage', params: { saleId: response.data.saleId } });
            } catch (error) {
                console.error('Error completing the sale:', error);
                this.error = 'Error completing the sale: ' + error.message;
            }
        },
        resetForm() {
            this.selectedProducts = [];
            this.discount = 0;
            this.customerDetails = {
                name: '',
                phone: '',
                email: ''
            };
            this.paymentMethod = 'cash';
            this.searchQuery = '';

        }
    },
    mounted() {
        this.fetchLatestProducts();
    }

};
</script>
