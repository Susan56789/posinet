<template>
    <div>
        <nav class="bg-gray-800 p-4">
            <ul class="flex space-x-4">
                <li>
                    <router-link to="/sales" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-dollar-sign mr-2"></i> Sales
                    </router-link>
                </li>
                <li>
                    <router-link to="/customers" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-users mr-2"></i> Customers
                    </router-link>
                </li>
                <li>
                    <router-link to="/suppliers" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-truck mr-2"></i> Suppliers
                    </router-link>
                </li>
                <li>
                    <router-link to="/inventory" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-boxes mr-2"></i> Inventory
                    </router-link>
                </li>
                <li>
                    <router-link to="/item-repair" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-tools mr-2"></i> Item Repair
                    </router-link>
                </li>
                <li>
                    <router-link to="/expenses" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-receipt mr-2"></i> Expenses
                    </router-link>
                </li>
                <li>
                    <router-link to="/reports" class="text-white flex items-center hover:text-gray-300">
                        <i class="fas fa-chart-line mr-2"></i> Reports
                    </router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
/* You can add any additional custom styles here if needed */
</style>
