<template>
    <div class="flex">
        <!-- Left Sidebar: Search Bar and Latest 10 Products -->
        <div class="w-1/3 p-4 border-r">
            <h2 class="text-xl font-bold mb-4">Latest Products</h2>
            <ul>
                <li v-for="product in latestProducts" :key="product._id">
                    <button @click="selectProduct(product)">
                        {{ product.title }} - {{ formatCurrency(product.price) }}
                    </button>
                </li>
            </ul>
            <h2 class="text-xl font-bold mt-8 mb-4">Search Product</h2>
            <input v-model="searchQuery" @input="searchProduct" placeholder="Search Product"
                class="w-full p-2 border rounded mb-4" />
        </div>

        <!-- Main Content: Sell Product -->
        <div class="w-2/3 p-4">
            <h1 class="text-2xl font-bold mb-4">Sell Product</h1>
            <form @submit.prevent="sellProduct">
                <input v-model="selectedProduct.title" placeholder="Product" readonly
                    class="w-full p-2 border rounded mb-4" />
                <input v-model="quantity" type="number" placeholder="Quantity" class="w-full p-2 border rounded mb-4" />
                <input v-model="coupon" placeholder="Coupon Code" class="w-full p-2 border rounded mb-4" />
                <input v-model="customerDetails" placeholder="Customer Details"
                    class="w-full p-2 border rounded mb-4" />
                <select v-model="paymentMethod" class="w-full p-2 border rounded mb-4">
                    <option value="cash">Cash</option>
                    <option value="mpesa">Mpesa</option>
                    <option value="bank">Bank</option>
                </select>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Complete Sale</button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'SalesPage',
    data() {
        return {
            searchQuery: '',
            selectedProduct: {},
            quantity: 1,
            coupon: '',
            customerDetails: '',
            paymentMethod: 'cash',
            error: '',
            latestProducts: []
        };
    },
    mounted() {
        this.fetchLatestProducts();
    },
    methods: {
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },
        async fetchLatestProducts() {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('https://posinet.onrender.com/api/products/latest', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.latestProducts = res.data;
            } catch (error) {
                this.error = 'Error fetching latest products';
            }
        },
        async searchProduct() {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`https://posinet.onrender.com/api/products/search?q=${this.searchQuery}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.selectedProduct = res.data[0]; // Assuming search returns an array
            } catch (error) {
                this.error = 'Error searching product';
            }
        },
        selectProduct(product) {
            this.selectedProduct = product;
        },
        async sellProduct() {
            const token = localStorage.getItem('token');
            if (this.selectedProduct.stock < this.quantity) {
                this.error = 'Not enough stock';
                return;
            }
            const sale = {
                productId: this.selectedProduct._id,
                quantity: this.quantity,
                coupon: this.coupon,
                customerDetails: this.customerDetails,
                paymentMethod: this.paymentMethod
            };
            try {
                await axios.post('https://posinet.onrender.com/api/sales', sale, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.selectedProduct.stock -= this.quantity;
                this.quantity = 1;
                this.coupon = '';
                this.customerDetails = '';
                this.paymentMethod = 'cash';
                this.error = '';
            } catch (error) {
                this.error = 'Error completing sale';
            }
        }
    }
};
</script>
