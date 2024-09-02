<template>
    <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-4">Manage Products</h2>

        <!-- Search and Add New Product -->
        <div class="flex justify-between mb-4">
            <input v-model="searchQuery" @input="applySearchFilter" type="text" placeholder="Search products..."
                class="w-64 px-4 py-2 border rounded-lg" />
            <button @click="openNewProductModal" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                Add New Product
            </button>
        </div>

        <!-- Products Table -->
        <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-gray-200">
                <tr>
                    <th class="px-4 py-2">Product Name</th>
                    <th class="px-4 py-2">Price (KES)</th>
                    <th class="px-4 py-2">Quantity</th>
                    <th class="px-4 py-2">Discount (KES)</th>
                    <th class="px-4 py-2">Total Price</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in paginatedProducts" :key="product._id" class="border-b">
                    <td class="px-4 py-2">{{ product.name }}</td>
                    <td class="px-4 py-2">{{ formatCurrency(product.price) }}</td>
                    <td class="px-4 py-2">{{ product.quantity }}</td>
                    <td class="px-4 py-2">
                        <input v-model.number="product.discount" type="number" step="0.01"
                            @input="updateProductPrice(product)" class="w-full px-2 py-1 border rounded" />
                    </td>
                    <td class="px-4 py-2">{{ formatCurrency(product.totalPrice) }}</td>
                    <td class="px-4 py-2">
                        <button @click="editProduct(product)"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2">
                            Edit
                        </button>
                        <button @click="deleteProduct(product._id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex justify-center">
            <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="[
                'mx-1 px-3 py-1 rounded',
                currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
            ]">
                {{ page }}
            </button>
        </div>

        <!-- Edit Product Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div class="bg-white p-6 rounded-lg">
                <h3 class="text-lg font-semibold mb-4">
                    {{ editingProduct._id ? 'Edit Product' : 'Add New Product' }}
                </h3>
                <input v-model="editingProduct.name" type="text" placeholder="Product Name"
                    class="w-full mb-2 px-3 py-2 border rounded-lg" />
                <input v-model.number="editingProduct.price" type="number" placeholder="Price (KES)"
                    class="w-full mb-2 px-3 py-2 border rounded-lg" />
                <input v-model.number="editingProduct.quantity" type="number" placeholder="Quantity"
                    class="w-full mb-2 px-3 py-2 border rounded-lg" />
                <input v-model.number="editingProduct.discount" type="number" placeholder="Discount (KES)"
                    class="w-full mb-4 px-3 py-2 border rounded-lg" />
                <div class="flex justify-end">
                    <button @click="saveProduct" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        Save
                    </button>
                    <button @click="showEditModal = false"
                        class="ml-2 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
    name: 'SalesManagement',
    setup() {
        const products = ref([]);
        const searchQuery = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 10;
        const showEditModal = ref(false);
        const editingProduct = ref({
            name: '',
            price: 0,
            quantity: 0,
            discount: 0,
            totalPrice: 0,
        });
        const selectedProduct = ref(null);

        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/products');
                products.value = response.data.map(product => ({
                    ...product,
                    totalPrice: calculateTotalPrice(product)
                }));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const applySearchFilter = async () => {
            await searchProducts();
        };

        const searchProducts = async () => {
            try {
                const query = searchQuery.value.trim();
                let url = 'https://posinet.onrender.com/api/products';

                if (query) {
                    url += `/search?q=${encodeURIComponent(query)}`;
                }

                const response = await axios.get(url);
                products.value = response.data.map(product => ({
                    ...product,
                    totalPrice: calculateTotalPrice(product)
                }));
                currentPage.value = 1; // Reset to the first page
            } catch (error) {
                console.error('Error searching products:', error);
            }
        };

        const paginatedProducts = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return products.value.slice(start, end);
        });

        const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));


        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page;
            }
        };

        const formatCurrency = (value) => {
            return value.toLocaleString('en-KE', {
                style: 'currency',
                currency: 'KES',
            });
        };

        const calculateTotalPrice = (product) => {
            const total = product.price * product.quantity - product.discount;
            return total > 0 ? total : 0;
        };

        const updateProductPrice = (product) => {
            product.totalPrice = calculateTotalPrice(product);
        };

        const editProduct = (product) => {
            editingProduct.value = { ...product };
            showEditModal.value = true;
        };

        const saveProduct = async () => {
            try {
                if (editingProduct.value._id) {
                    await axios.put(`https://posinet.onrender.com/api/products/${editingProduct.value._id}`, editingProduct.value);
                } else {
                    await axios.post('https://posinet.onrender.com/api/products', editingProduct.value);
                }
                await fetchProducts();
                showEditModal.value = false;
            } catch (error) {
                console.error('Error saving product:', error);
            }
        };

        const deleteProduct = async (id) => {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await axios.delete(`https://posinet.onrender.com/api/products/${id}`);
                    await fetchProducts();
                } catch (error) {
                    console.error('Error deleting product:', error);
                }
            }
        };

        const openNewProductModal = () => {
            editingProduct.value = {
                name: '',
                price: 0,
                quantity: 0,
                discount: 0,
                totalPrice: 0,
            };
            showEditModal.value = true;
        };

        const sellProduct = (product) => {
            // Implement logic to sell the selected product here
            console.log('Selling product:', product);
        };

        onMounted(fetchProducts);

        return {
            products,
            searchQuery,
            currentPage,
            paginatedProducts,
            totalPages,
            showEditModal,
            editingProduct,
            selectedProduct,
            applySearchFilter,
            searchProducts,
            formatCurrency,
            calculateTotalPrice,
            editProduct,
            saveProduct,
            deleteProduct,
            openNewProductModal,
            changePage,
            updateProductPrice,
            sellProduct,


        };
    }
}
</script>
