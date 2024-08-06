<template>
    <nav class="bg-gray-800 p-4">
        <div class="container mx-auto">
            <div class="flex justify-between items-center">
                <button @click="toggleMenu" class="text-white lg:hidden">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="hidden lg:block w-full">
                    <ul class="flex space-x-4">
                        <li v-for="(item, index) in menuItems" :key="index">
                            <router-link :to="item.route" class="text-white flex items-center hover:text-gray-300">
                                <i :class="['mr-2', item.icon]"></i> {{ item.label }}
                            </router-link>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
        <div :class="{ 'hidden': !isMenuOpen, 'block': isMenuOpen }" class="lg:hidden">
            <ul class="pt-2 pb-3 space-y-1">
                <li v-for="(item, index) in menuItems" :key="index">
                    <router-link :to="item.route"
                        class="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700">
                        <i :class="['mr-2', item.icon]"></i> {{ item.label }}
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            isMenuOpen: false,
            menuItems: [
                { label: 'Sales', route: '/sales', icon: 'fas fa-dollar-sign' },
                { label: 'Customers', route: '/customers', icon: 'fas fa-users' },
                { label: 'Suppliers', route: '/suppliers', icon: 'fas fa-truck' },
                { label: 'Inventory', route: '/inventory', icon: 'fas fa-boxes' },
                { label: 'Item Repair', route: '/item-repair', icon: 'fas fa-tools' },
                { label: 'Expenses', route: '/expenses', icon: 'fas fa-receipt' },
                { label: 'Reports', route: '/reports', icon: 'fas fa-chart-line' },
            ]
        };
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
    }
};
</script>
