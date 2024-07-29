<!-- src/components/Sales.vue -->
<template>
    <div>
        <h1>Sales</h1>
        <form @submit.prevent="sellProduct">
            <input v-model="searchQuery" @input="searchProduct" placeholder="Search Product" />
            <input v-model="selectedProduct.name" placeholder="Product" readonly />
            <input v-model="quantity" type="number" placeholder="Quantity" />
            <input v-model="coupon" placeholder="Coupon Code" />
            <button type="submit">Sell Product</button>
        </form>
        <p v-if="error">{{ error }}</p>
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
            error: ''
        };
    },
    methods: {
        async searchProduct() {
            const token = localStorage.getItem('token');
            const res = await axios.get(`https://posinet.onrender.com/products/search?q=${this.searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            this.selectedProduct = res.data;
        },
        async sellProduct() {
            if (this.selectedProduct.quantity < this.quantity) {
                this.error = 'Not enough stock';
                return;
            }
            const token = localStorage.getItem('token');
            const sale = {
                productId: this.selectedProduct._id,
                quantity: this.quantity,
                coupon: this.coupon
            };
            await axios.post('https://posinet.onrender.com/sales', sale, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            this.selectedProduct.quantity -= this.quantity;
            this.quantity = 1;
            this.coupon = '';
            this.error = '';
        }
    }
};
</script>