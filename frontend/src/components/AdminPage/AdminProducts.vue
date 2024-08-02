<template>
    <div class="manage-products">
        <h1 class="text-2xl font-bold mb-4">Manage Products</h1>
        <button @click="addProduct" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">Add
            Product</button>
        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Name</th>
                    <th class="py-2 px-4">Price</th>
                    <th class="py-2 px-4">Stock</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product._id" class="border-b">
                    <td class="py-2 px-4">{{ product.name }}</td>
                    <td class="py-2 px-4">${{ product.price }}</td>
                    <td class="py-2 px-4">{{ product.stock }}</td>
                    <td class="py-2 px-4">
                        <button @click="editProduct(product)"
                            class="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600">Edit</button>
                        <button @click="deleteProduct(product._id)"
                            class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'AdminProducts',

    data() {
        return {
            products: []
        };
    },
    methods: {
        fetchProducts() {
            // Fetch products from the backend
        },
        addProduct() {
            // Add product logic
        },
        editProduct(product) {
            // Edit product logic
            console.log(product)
        },
        deleteProduct(productId) {
            console.log(productId)
            // Delete product logic
        }
    },
    mounted() {
        this.fetchProducts();
    }
}
</script>