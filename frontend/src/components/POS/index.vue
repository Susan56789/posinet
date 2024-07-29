<template>
    <div>
        <h1>PosiNet POS System</h1>
        <form @submit.prevent="addSale">
            <input v-model="product" placeholder="Product" />
            <input v-model="quantity" type="number" placeholder="Quantity" />
            <input v-model="price" type="number" placeholder="Price" />
            <button type="submit">Add Sale</button>
        </form>
        <ul>
            <li v-for="sale in sales" :key="sale._id">{{ sale.product }} - {{ sale.quantity }} - {{ sale.price }}</li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'POS',
    data() {
        return {
            product: '',
            quantity: 0,
            price: 0,
            sales: []
        };
    },
    methods: {
        async addSale() {
            const newSale = {
                product: this.product,
                quantity: this.quantity,
                price: this.price
            };
            const res = await axios.post('https://posinet.onrender.com/sales', newSale);
            this.sales.push(res.data);
            this.product = '';
            this.quantity = 0;
            this.price = 0;
        },
        async fetchSales() {
            const res = await axios.get('https://posinet.onrender.com/sales');
            this.sales = res.data;
        }
    },
    mounted() {
        this.fetchSales();
    }
};
</script>