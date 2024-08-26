<template>
    <div class="flex flex-col md:flex-row h-screen">
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
                            <div @click="addProductToSale(result)">
                                <p>{{ result.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatCurrency(result.price) }}</p>
                            </div>
                            <div class="flex items-center">
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
                        </div>
                        <div class="flex items-center">
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
                        <label class="block text-gray-700 mb-2">Coupon Code</label>
                        <input v-model="coupon" placeholder="Coupon Code" class="w-full p-3 border rounded" />
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

export default {
    name: "SalesPage",
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            selectedProducts: [],
            coupon: '',
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
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('https://posinet.onrender.com/api/products/latest', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.latestProducts = res.data.map(product => ({
                    ...product,
                    selectedQuantity: 0
                }));
            } catch (error) {
                this.error = 'Error fetching latest products';
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
                    headers: { Authorization: `Bearer ${token}` },
                    params: { query: this.searchQuery }
                });
                this.searchResults = response.data.map(product => ({
                    ...product,
                    selectedQuantity: product.selectedQuantity || 0
                }));
            } catch (error) {
                this.error = 'Error searching for products';
            }
        },
        addProductToSale(product) {
            const existingProduct = this.selectedProducts.find(p => p._id === product._id);
            if (existingProduct) {
                existingProduct.selectedQuantity += 1;
            } else {
                this.selectedProducts.push({ ...product, selectedQuantity: 1 });
            }
            this.searchQuery = '';
            this.searchResults = [];
            this.calculateTotalAmount();
        },
        increaseQuantity(product) {
            const targetProduct = this.selectedProducts.find(p => p._id === product._id);
            if (targetProduct) {
                targetProduct.selectedQuantity += 1;
            } else {
                product.selectedQuantity += 1;
                this.selectedProducts.push(product);
            }
            this.calculateTotalAmount();
        },
        decreaseQuantity(product) {
            const targetProduct = this.selectedProducts.find(p => p._id === product._id);
            if (targetProduct) {
                targetProduct.selectedQuantity -= 1;
                if (targetProduct.selectedQuantity <= 0) {
                    this.selectedProducts = this.selectedProducts.filter(p => p._id !== product._id);
                }
            } else {
                if (product.selectedQuantity > 0) {
                    product.selectedQuantity -= 1;
                }
            }
            this.calculateTotalAmount();
        },
        calculateTotalAmount() {
            this.totalAmount = this.selectedProducts.reduce((sum, product) => sum + product.selectedQuantity * product.price, 0);
        },
        async sellProduct() {
            const token = localStorage.getItem('token');
            if (this.selectedProducts.some(product => product.stock < product.selectedQuantity)) {
                this.error = 'One or more products do not have enough stock';
                return;
            }
            const sale = {
                products: this.selectedProducts.map(product => ({
                    productId: product._id,
                    quantity: product.selectedQuantity,
                    price: product.price,
                })),
                coupon: this.coupon,
                customerDetails: this.customerDetails,
                paymentMethod: this.paymentMethod,
                totalAmount: this.totalAmount,
                date: new Date().toISOString()
            };
            try {
                console.log('Sending sale data:', JSON.stringify(sale));
                // Create sale
                const saleResponse = await axios.post('https://posinet.onrender.com/api/sales', sale, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Sale response:', saleResponse.data);

                // Create or update customer
                const customerData = {
                    name: this.customerDetails.name,
                    phone: this.customerDetails.phone,
                    email: this.customerDetails.email,
                    lastPurchaseDate: new Date().toISOString(),
                    totalPurchases: this.totalAmount,
                    lastSaleId: saleResponse.data.saleId
                };
                console.log('Sending customer data:', JSON.stringify(customerData));
                const customerResponse = await axios.post('https://posinet.onrender.com/api/customers', customerData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Customer response:', customerResponse.data);

                // Clear form
                this.selectedProducts = [];
                this.coupon = '';
                this.customerDetails = { name: '', phone: '', email: '' };
                this.totalAmount = 0;
                this.error = '';

                // Show success message
                this.$emit('sale-completed', saleResponse.data.saleId);
                alert(`Sale completed successfully! Sale ID: ${saleResponse.data.saleId}`);
            } catch (error) {
                console.error('Error completing sale:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    console.error('Error status:', error.response.status);
                    console.error('Error headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                this.error = 'Error completing sale: ' + (error.response?.data?.message || error.message);
            }
        },
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },
    }
};
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
