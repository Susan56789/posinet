<template>
    <div class="admin-dashboard">
        <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Quick Stats</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ stats.productCount }}</p>
                        <p class="text-gray-600">Products</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600">{{ stats.userCount }}</p>
                        <p class="text-gray-600">Users</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-yellow-600">{{ formatCurrency(stats.totalSales) }}</p>
                        <p class="text-gray-600">Sales Today</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-red-600">{{ stats.needReorderCount }}</p>
                        <p class="text-gray-600">Need Reorder</p>
                    </div>
                </div>
            </div>


            <!-- Recent Activities -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
                <ul class="space-y-2 overflow-y-auto max-h-72">
                    <li v-for="(activity, index) in recentActivities" v-show="index < 10" :key="activity._id"
                        class="flex items-center">
                        <span class="w-4 h-4 rounded-full mr-2" :class="activityTypeColor(activity.type)">
                        </span>
                        <p class="text-sm">{{ activity.description }}</p>
                        <span class="text-xs text-gray-500 ml-auto">
                            {{ formatDate(activity.timestamp) }}
                        </span>
                    </li>
                </ul>
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
                        <th class="py-2 px-4">Payment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sale in recentSales" :key="sale._id" class="border-b">
                        <td class="py-2 px-4">{{ sale._id }}</td>
                        <td class="py-2 px-4">{{ sale.customerDetails.name }}</td>
                        <td class="py-2 px-4">{{ formatCurrency(sale.totalAmount) }}</td>
                        <td class="py-2 px-4">
                            <span class="px-2 py-1 rounded text-xs" :class="saleStatusColor(sale.paymentMethod)">
                                {{ sale.paymentMethod }}
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
            stats: {
                productCount: 0,
                userCount: 0,
                totalSales: 0,
                needReorderCount: 0,
            },
            recentSales: [],
            recentActivities: [],
            isLoading: true,
        };
    },
    methods: {
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },

        saleStatusColor(status) {
            const colors = {
                Mpesa: 'bg-green-200 text-green-800',
                Bank: 'bg-yellow-200 text-yellow-800',
                Cash: 'bg-blue-200 text-blue-800',
                Credit: 'bg-purple-200 text-purple-800',
            };
            return colors[status] || 'bg-gray-200 text-gray-800';
        },

        async fetchDashboardData() {
            this.isLoading = true;
            try {
                const [dashboardData, recentSalesData, activitiesData] = await Promise.all([
                    axios.get('https://posinet.onrender.com/api/admin/dashboard', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    axios.get('https://posinet.onrender.com/api/sales/recent', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    axios.get('https://posinet.onrender.com/api/activities/recent', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ]);

                const { data } = dashboardData;
                this.stats.productCount = data.productCount;
                this.stats.userCount = data.userCount;
                this.stats.totalSales = data.totalSales;
                this.stats.needReorderCount = data.needReorderCount;

                this.recentSales = recentSalesData.data.slice(0, 10) || [];
                this.recentActivities = activitiesData.data.slice(0, 10) || [];
            } catch (error) {
                console.error('Error fetching dashboard data:', error);

            } finally {
                this.isLoading = false;
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        activityTypeColor(type) {
            const colors = {
                'new-user': 'bg-blue-500',
                'new-order': 'bg-green-500',
                'product-update': 'bg-yellow-500',
            };
            return colors[type] || 'bg-gray-500';
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
        this.fetchDashboardData();
    },
};
</script>


<style scoped>
.admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

ul.space-y-2 {
    max-height: 18rem;
    /* Set the height for the scrollable area */
    overflow-y: auto;
}

ul.space-y-2::-webkit-scrollbar {
    width: 8px;
}

ul.space-y-2::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}
</style>
