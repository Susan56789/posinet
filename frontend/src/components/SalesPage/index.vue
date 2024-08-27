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
                <ul v-if="searchResults.length" class="absolute left-0 right-0 bg-white border rounded mt-2 z-10">
                    <li v-for="result in searchResults" :key="result._id" class="p-2 hover:bg-gray-200 cursor-pointer">
                        <div class="flex justify-between items-center">
                            <div @click="addProductToSale(result)" v-if="result.stock > 0">
                                <p>{{ result.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatCurrency(result.price) }}</p>
                                <p class="text-xs text-green-600">In Stock: {{ result.stock }}</p>
                            </div>
                            <div v-else>
                                <p>{{ result.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatCurrency(result.price) }}</p>
                                <p class="text-xs text-red-600">Out of Stock</p>
                            </div>
                            <div v-if="result.stock > 0" class="flex items-center">
                                <button @click.stop="decreaseQuantity(result)"
                                    class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    :disabled="!result.selectedQuantity || result.selectedQuantity === 0">
                                    -
                                </button>
                                <span class="mx-2">{{ result.selectedQuantity || 0 }}</span>
                                <button @click.stop="increaseQuantity(result)"
                                    class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                                    +
                                </button>
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
                    <div v-if="selectedProducts.length > 0" class="mb-4">
                        <label class="block text-gray-700 mb-2">Selected Products</label>
                        <table class="w-full mb-4">
                            <thead>
                                <tr>
                                    <th class="text-left p-2 border-b">Item</th>
                                    <th class="text-right p-2 border-b">Price</th>
                                    <th class="text-right p-2 border-b">Quantity</th>
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
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Discount</label>
                        <input v-model.number="discount" placeholder="Discount Amount (Max 500)"
                            class="w-full p-3 border rounded" type="number" min="0" :max="500" />
                    </div>

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
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">Payment Method</label>
                        <select v-model="paymentMethod" class="w-full p-3 border rounded">
                            <option value="cash">Cash</option>
                            <option value="mpesa">Mpesa</option>
                            <option value="bank">Bank</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Total Summary -->
            <div class="mt-4 p-4 bg-gray-100 rounded shadow">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-semibold">Total Cost</h2>
                    <p class="text-xl font-semibold">{{ formatCurrency(totalAmount) }}</p>
                </div>
                <button @click="sellProduct" class="w-full bg-blue-500 text-white py-3 mt-4 rounded hover:bg-blue-600">
                    Complete Sale
                </button>
            </div>

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
            if (this.searchQuery.length < 2) {
                this.searchResults = [];
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://posinet.onrender.com/api/products/search`, {
                    params: {
                        query: this.searchQuery
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.searchResults = response.data.map(product => ({
                    ...product,
                    selectedQuantity: 0,
                    price: product.salePrice
                }));
            } catch (error) {
                console.error('Error searching products:', error);
                this.error = 'Error searching products: ' + error.message;
            }
        },
        addProductToSale(product) {
            if (product.stock > 0) {
                const existingProduct = this.selectedProducts.find(p => p._id === product._id);
                if (existingProduct) {
                    existingProduct.selectedQuantity += 1;
                } else {
                    this.selectedProducts.push({
                        ...product,
                        selectedQuantity: 1,
                        price: product.salePrice
                    });
                }
                this.searchQuery = '';
                this.searchResults = [];
                this.calculateTotalAmount();
            }
        },
        increaseQuantity(product) {
            if (product.stock > 0) {
                const targetProduct = this.selectedProducts.find(p => p._id === product._id);
                if (targetProduct) {
                    targetProduct.selectedQuantity++;
                } else {
                    product.selectedQuantity++;
                    this.selectedProducts.push({ ...product });
                }
                this.calculateTotalAmount();
            }
        },
        decreaseQuantity(product) {
            const targetProduct = this.selectedProducts.find(p => p._id === product._id);
            if (targetProduct && targetProduct.selectedQuantity > 0) {
                targetProduct.selectedQuantity--;
            }
            if (targetProduct && targetProduct.selectedQuantity === 0) {
                this.selectedProducts = this.selectedProducts.filter(p => p._id !== product._id);
            }
            this.calculateTotalAmount();
        },
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },
        calculateTotalAmount() {
            let subtotal = 0;

            this.selectedProducts.forEach(product => {
                subtotal += product.selectedQuantity * product.price;
            });

            // Apply discount (capped at 500)
            const discountAmount = Math.min(this.discount, 500);
            subtotal -= discountAmount;

            this.totalAmount = subtotal;

        },
        async sellProduct() {
            try {
                // Validation
                if (this.selectedProducts.length === 0) {
                    throw new Error("Please select at least one product");
                }
                if (!this.customerDetails.name.trim() || !this.customerDetails.phone.trim()) {
                    throw new Error("Customer name and phone are required");
                }
                if (!this.paymentMethod) {
                    throw new Error("Please select a payment method");
                }
                if (this.totalAmount <= 0) {
                    throw new Error("Total amount must be greater than zero");
                }
                if (!this.userName) {
                    throw new Error("Server name is required");
                }

                const sale = {
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

                console.log('Sending sale data:', JSON.stringify(sale, null, 2));

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authorization token is missing. Please log in again.');
                }

                const saleResponse = await axios.post('https://posinet.onrender.com/api/sales', sale, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('Sale response:', saleResponse.data);

                // Clear form and redirect to receipt page
                this.clearForm();
                this.$router.push({ name: 'ReceiptPage', params: { saleId: saleResponse.data.saleId } });

            } catch (error) {
                console.error('Error completing sale:', error);
                this.error = error.response?.data?.message || error.message;
            }
        },

        clearForm() {
            this.selectedProducts = [];
            this.discount = 0;
            this.customerDetails = { name: '', phone: '', email: '' };
            this.paymentMethod = 'cash';
            this.totalAmount = 0;
            this.error = '';
        }
    },
    watch: {
        discount() {
            this.calculateTotalAmount();
        }
    }
};
</script>



<style scoped>
/* Add your styles here */
</style>
