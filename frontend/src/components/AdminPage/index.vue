<template>
    <div class="admin-dashboard">
        <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Quick Stats</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ totalProducts }}</p>
                        <p class="text-gray-600">Products</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600">{{ totalUsers }}</p>
                        <p class="text-gray-600">Users</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-yellow-600">${{ totalSales }}</p>
                        <p class="text-gray-600">Total Sales</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-purple-600">{{ pendingOrders }}</p>
                        <p class="text-gray-600">Pending Orders</p>
                    </div>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
                <ul class="space-y-2">
                    <li v-for="activity in recentActivities" :key="activity.id" class="flex items-center">
                        <span class="w-4 h-4 rounded-full mr-2" :class="activityTypeColor(activity.type)"></span>
                        <p class="text-sm">{{ activity.description }}</p>
                    </li>
                </ul>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
                <div class="space-y-2">
                    <button @click="addProduct"
                        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">Add
                        Product</button>
                    <button @click="manageUsers"
                        class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200">Manage
                        Users</button>
                    <button @click="viewReports"
                        class="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200">View
                        Reports</button>
                </div>
            </div>
        </div>

        <!-- Recent Sales -->
        <div class="mt-8 bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Recent Sales</h2>
            <table class="w-full">
                <thead>
                    <tr class="text-left bg-gray-100">
                        <th class="py-2 px-4">Order ID</th>
                        <th class="py-2 px-4">Customer</th>
                        <th class="py-2 px-4">Amount</th>
                        <th class="py-2 px-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sale in recentSales" :key="sale.id" class="border-b">
                        <td class="py-2 px-4">{{ sale.orderId }}</td>
                        <td class="py-2 px-4">{{ sale.customer }}</td>
                        <td class="py-2 px-4">${{ sale.amount }}</td>
                        <td class="py-2 px-4">
                            <span class="px-2 py-1 rounded text-xs" :class="saleStatusColor(sale.status)">
                                {{ sale.status }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AdminDashboard',
    data() {
        return {
            totalProducts: 0,
            totalUsers: 0,
            totalSales: 0,
            pendingOrders: 0,
            recentActivities: [],
            recentSales: [],
        };
    },
    methods: {
        activityTypeColor(type) {
            const colors = {
                product: 'bg-blue-500',
                user: 'bg-green-500',
                order: 'bg-yellow-500',
                report: 'bg-purple-500',
            };
            return colors[type] || 'bg-gray-500';
        },
        saleStatusColor(status) {
            const colors = {
                Completed: 'bg-green-200 text-green-800',
                Pending: 'bg-yellow-200 text-yellow-800',
                Processing: 'bg-blue-200 text-blue-800',
                Shipped: 'bg-purple-200 text-purple-800',
            };
            return colors[status] || 'bg-gray-200 text-gray-800';
        },
        async fetchStats() {
            try {
                const [productRes, userRes, salesRes, pendingOrdersRes] = await Promise.all([
                    axios.get('https://posinet.onrender.com/api/products/count'),
                    axios.get('https://posinet.onrender.com/api/users/count'),
                    axios.get('https://posinet.onrender.com/api/sales/total'),
                    axios.get('https://posinet.onrender.com/api/orders/pending/count'),
                ]);

                this.totalProducts = productRes.data.count;
                this.totalUsers = userRes.data.count;
                this.totalSales = salesRes.data.total;
                this.pendingOrders = pendingOrdersRes.data.count;
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        },
        async fetchRecentActivities() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/activities/recent');
                this.recentActivities = response.data;
            } catch (error) {
                console.error('Error fetching recent activities:', error);
            }
        },
        async fetchRecentSales() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/sales/recent');
                this.recentSales = response.data;
            } catch (error) {
                console.error('Error fetching recent sales:', error);
            }
        },
        addProduct() {
            // Implement add product functionality
        },
        manageUsers() {
            // Implement manage users functionality
        },
        viewReports() {
            // Implement view reports functionality
        },
    },
    mounted() {
        this.fetchStats();
        this.fetchRecentActivities();
        this.fetchRecentSales();
    },
};
</script>

<style scoped>
.admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
</style>
