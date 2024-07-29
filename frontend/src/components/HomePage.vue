<template>
    <div class="bg-gray-100 min-h-screen">
        <!-- Hero Section -->
        <section class="bg-blue-600 text-white text-center py-20">
            <div class="container mx-auto px-4">
                <h1 class="text-4xl font-bold mb-4">Welcome to Posinet</h1>
                <p class="text-lg mb-8">Your ultimate point-of-sale solution for efficient business management.</p>
                <router-link to="/login"
                    class="inline-block bg-white text-blue-600 py-2 px-6 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors">
                    Get Started
                </router-link>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-16">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
                <div class="flex flex-wrap -mx-4">
                    <div class="w-full md:w-1/3 px-4 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-lg">
                            <h3 class="text-xl font-semibold mb-4">Inventory Management</h3>
                            <p>Effortlessly manage and track your inventory with our intuitive tools.</p>
                        </div>
                    </div>
                    <div class="w-full md:w-1/3 px-4 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-lg">
                            <h3 class="text-xl font-semibold mb-4">Sales Tracking</h3>
                            <p>Monitor your sales performance and generate reports to drive business growth.</p>
                        </div>
                    </div>
                    <div class="w-full md:w-1/3 px-4 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-lg">
                            <h3 class="text-xl font-semibold mb-4">Customer Management</h3>
                            <p>Keep track of customer details and history to enhance your service.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>




    </div>
</template>

<script>
export default {
    name: 'HomePage'
};
</script>

<style scoped>
/* Add any additional custom styles here if necessary */
</style>
