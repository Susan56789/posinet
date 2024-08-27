<template>
    <div class="p-4 max-w-3xl mx-auto">
        <!-- Receipt Header -->
        <div class="text-center">
            <h1 class="text-3xl font-bold mb-4">Receipt</h1>
            <p class="text-gray-600">Receipt ID: {{ receiptId }}</p>
            <p class="text-gray-600">Date: {{ formattedDate }}</p>
        </div>

        <!-- Customer Information -->
        <div class="my-6">
            <h2 class="text-xl font-semibold">Customer Information</h2>
            <p>Name: {{ receipt.customer.name }}</p>
            <p>Phone: {{ receipt.customer.phone }}</p>
            <p>Email: {{ receipt.customer.email }}</p>
        </div>

        <!-- Product List -->
        <table class="w-full my-6 border-collapse">
            <thead>
                <tr>
                    <th class="p-2 border text-left">Item</th>
                    <th class="p-2 border text-right">Price</th>
                    <th class="p-2 border text-right">Quantity</th>
                    <th class="p-2 border text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in receipt.products" :key="product.productId">
                    <td class="p-2 border">{{ product.title }}</td>
                    <td class="p-2 border text-right">{{ formatCurrency(product.price) }}</td>
                    <td class="p-2 border text-right">{{ product.quantity }}</td>
                    <td class="p-2 border text-right">{{ formatCurrency(product.price * product.quantity) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Payment Summary -->
        <div class="my-6">
            <h2 class="text-xl font-semibold">Payment Summary</h2>
            <p>Subtotal: {{ formatCurrency(subtotal) }}</p>
            <p>Discount: {{ formatCurrency(receipt.discount) }}</p>
            <p class="text-lg font-bold">Total Amount: {{ formatCurrency(receipt.totalAmount) }}</p>
        </div>

        <!-- Payment Method -->
        <div class="my-6">
            <h2 class="text-xl font-semibold">Payment Method</h2>
            <p>{{ receipt.paymentMethod }}</p>
        </div>

        <!-- Print Button -->
        <div class="mt-6">
            <button @click="printReceipt" class="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600">
                Print Receipt
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "ReceiptPage",
    data() {
        return {
            receiptId: this.$route.query.saleId || "",
            receipt: {
                customer: {
                    name: "",
                    phone: "",
                    email: ""
                },
                products: [],
                discount: 0,
                totalAmount: 0,
                paymentMethod: ""
            },
            error: ""
        };
    },
    created() {
        this.fetchReceipt();
    },
    computed: {
        formattedDate() {
            return new Date().toLocaleDateString();
        },
        subtotal() {
            return this.receipt.products.reduce(
                (acc, product) => acc + product.price * product.quantity,
                0
            );
        }
    },
    methods: {
        async fetchReceipt() {
            try {
                const response = await axios.get(
                    `https://posinet.onrender.com/api/sales/${this.receiptId}`
                );
                this.receipt = response.data;
            } catch (error) {
                console.error("Error fetching receipt:", error);
                this.error = "Error fetching receipt: " + error.message;
            }
        },
        formatCurrency(amount) {
            return `Ksh ${amount.toLocaleString()}`;
        },
        printReceipt() {
            window.print();
        }
    }
};
</script>

<style scoped>
/* Styling for print media */
@media print {

    /* Hide the print button */
    button {
        display: none;
    }

    /* Simplify layout for printing */
    body {
        margin: 0;
        padding: 0;
    }

    .p-4 {
        padding: 0 !important;
    }

    .max-w-3xl {
        max-width: 100%;
    }

    table {
        width: 100%;
    }
}
</style>