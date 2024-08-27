<template>
    <div class="p-4 max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Customers</h1>

        <div class="flex items-center space-x-4">
            <!-- Search Bar -->
            <div class="flex-1">
                <input v-model="searchQuery" @input="fetchCustomers" type="text" placeholder="Search customers..."
                    class="p-2 border border-gray-300 rounded w-full" />
            </div>
            <!-- Export Button -->
            <div>
                <button @click="exportToExcel" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Export as Excel
                </button>
            </div>
        </div>
        <!-- Customer Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-2 px-4 border-b text-left">Name</th>
                        <th class="py-2 px-4 border-b text-left">Phone</th>
                        <th class="py-2 px-4 border-b text-left">Email</th>
                        <th class="py-2 px-4 border-b text-left">Last Purchase Date</th>
                        <th class="py-2 px-4 border-b text-left">Total Purchases</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="customer in paginatedCustomers" :key="customer._id" class="hover:bg-gray-50">
                        <td class="py-2 px-4 border-b">{{ customer.name }}</td>
                        <td class="py-2 px-4 border-b">{{ customer.phone }}</td>
                        <td class="py-2 px-4 border-b">{{ customer.email }}</td>
                        <td class="py-2 px-4 border-b">
                            {{ formatDate(customer.lastPurchaseDate) }}
                        </td>
                        <td class="py-2 px-4 border-b">
                            {{ formatCurrency(customer.totalPurchases) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">
                Previous
            </button>
            <p>Page {{ currentPage }} of {{ totalPages }}</p>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">
                Next
            </button>
        </div>


    </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
    name: "CustomersPage",
    data() {
        return {
            customers: [],
            searchQuery: "",
            currentPage: 1,
            perPage: 50,
            loading: false,
            error: ""
        };
    },
    computed: {
        filteredCustomers() {
            if (!this.searchQuery) return this.customers;

            const query = this.searchQuery.toLowerCase();
            return this.customers.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(query) ||
                    customer.phone.toLowerCase().includes(query) ||
                    customer.email.toLowerCase().includes(query)
            );
        },
        paginatedCustomers() {
            const start = (this.currentPage - 1) * this.perPage;
            const end = this.currentPage * this.perPage;
            return this.filteredCustomers.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredCustomers.length / this.perPage);
        }
    },
    methods: {
        async fetchCustomers() {
            this.loading = true;
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("https://posinet.onrender.com/api/customers", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.customers = response.data;
            } catch (error) {
                console.error("Error fetching customers:", error);
                this.error = "Error fetching customers.";
            } finally {
                this.loading = false;
            }
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatCurrency(amount) {
            return `Ksh ${amount.toLocaleString()}`;
        },
        exportToExcel() {
            const data = this.filteredCustomers.map((customer) => ({
                Name: customer.name,
                Phone: customer.phone,
                Email: customer.email,
                "Last Purchase Date": this.formatDate(customer.lastPurchaseDate),
                "Total Purchases": this.formatCurrency(customer.totalPurchases)
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

            XLSX.writeFile(workbook, "customers.xlsx");
        }
    },
    created() {
        this.fetchCustomers();
    }
};
</script>