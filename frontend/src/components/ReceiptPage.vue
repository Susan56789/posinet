<template>
    <div class="p-4 max-w-3xl mx-auto">
        <div id="printableArea">
            <!-- Receipt Header -->
            <div class="text-center">
                <h1 class="text-3xl font-bold mb-4">Receipt</h1>
                <p class="text-gray-600">Receipt ID: {{ receiptId }}</p>
                <p class="text-gray-600">Date: {{ formattedDate }}</p>
            </div>

            <!-- Customer Information -->
            <div class="my-6"
                v-if="receipt.customerDetails.name || receipt.customerDetails.phone || receipt.customerDetails.email">
                <h2 class="text-xl font-semibold">Customer Information</h2>
                <p v-if="receipt.customerDetails.name">Name: {{ receipt.customerDetails.name }}</p>
                <p v-if="receipt.customerDetails.phone">Phone: {{ receipt.customerDetails.phone }}</p>
                <p v-if="receipt.customerDetails.email">Email: {{ receipt.customerDetails.email }}</p>
            </div>

            <!-- Product List -->
            <table class="w-full my-6 border-collapse" v-if="receipt.products.length > 0">
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
                        <td class="p-2 border">{{ product.name }}</td>
                        <td class="p-2 border text-right">{{ formatCurrency(product.price) }}</td>
                        <td class="p-2 border text-right">{{ product.quantity }}</td>
                        <td class="p-2 border text-right">{{ formatCurrency(product.price * product.quantity) }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Payment Summary -->
            <div class="my-6" v-if="subtotal > 0">
                <h2 class="text-xl font-semibold">Payment Summary</h2>
                <p>Subtotal: {{ formatCurrency(subtotal) }}</p>
                <p v-if="receipt.discount">Discount: {{ formatCurrency(receipt.discount) }}</p>
                <p class="text-lg font-bold">Total Amount: {{ formatCurrency(receipt.totalAmount) }}</p>
            </div>

            <!-- Payment Method -->
            <div class="my-6" v-if="receipt.paymentMethod">
                <h2 class="text-xl font-semibold">Payment Method</h2>
                <p>{{ receipt.paymentMethod }}</p>
            </div>

            <!-- Served By -->
            <div class="my-6" v-if="receipt.servedBy">
                <h2 class="text-xl font-semibold">Served By</h2>
                <p>{{ receipt.servedBy }}</p>
            </div>

            <!-- Error Message -->
            <div class="my-6 text-red-500" v-if="error">
                <p>Error: {{ error }}</p>
            </div>
        </div>

        <!-- Print Button -->
        <div class="mt-6 no-print">
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
            receiptId: this.$route.params.id || "",
            receipt: {
                customerDetails: {
                    name: "",
                    phone: "",
                    email: ""
                },
                products: [],
                discount: 0,
                totalAmount: 0,
                paymentMethod: "",
                servedBy: ""  // Added servedBy field
            },
            error: ""
        };
    },
    created() {
        this.fetchReceipt();
    },
    computed: {
        formattedDate() {
            return this.receipt.date ? new Date(this.receipt.date).toLocaleDateString() : "";
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
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://posinet.onrender.com/api/sales/${this.receiptId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                this.receipt = response.data;
            } catch (error) {
                console.error("Error fetching receipt:", error);
                if (error.response && error.response.status === 401) {
                    this.error = "Unauthorized: Please log in to view this receipt.";
                } else {
                    this.error = "Error fetching receipt: " + error.message;
                }
            }
        },
        formatCurrency(amount) {
            return `Ksh ${amount.toLocaleString()}`;
        },
        printReceipt() {
            const printContent = document.getElementById('printableArea').innerHTML;
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
        }
    }
};
</script>
