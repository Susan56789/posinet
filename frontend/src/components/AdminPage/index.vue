<template>
    <div>
        <h1>Admin Dashboard</h1>
        <form @submit.prevent="addProduct">
            <input v-model="product.name" placeholder="Product Name" />
            <input v-model="product.quantity" type="number" placeholder="Quantity" />
            <input v-model="product.price" type="number" placeholder="Price" />
            <button type="submit">Add Product</button>
        </form>
        <ul>
            <li v-for="product in products" :key="product._id">{{ product.name }} - {{ product.quantity }} - {{
            product.price }}</li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AdminPage',
    data() {
        return {
            product: {
                name: '',
                quantity: 0,
                price: 0
            },
            products: []
        };
    },
    methods: {
        async addProduct() {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/products', this.product, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            this.products.push(res.data);
            this.product = { name: '', quantity: 0, price: 0 };
        },
        async fetchProducts() {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            this.products = res.data;
        }
    },
    mounted() {
        this.fetchProducts();
    }
};
</script>