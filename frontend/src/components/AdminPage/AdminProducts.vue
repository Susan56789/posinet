<template>
    <div class="manage-products">
        <h1 class="text-2xl font-bold mb-4">Manage Products</h1>
        <button @click="showAddProductForm" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">
            Add Product
        </button>

        <!-- Search Input -->
        <input v-model="searchQuery" @input="applyFilters" placeholder="Search products..."
            class="border p-2 mb-4 w-full" />

        <!-- Add/Edit Product Form -->
        <div v-if="showForm" class="mb-4">
            <h2 class="text-xl font-bold mb-2">{{ editMode ? 'Edit' : 'Add' }} Product</h2>
            <form @submit.prevent="editMode ? updateProduct() : createProduct()">
                <input v-model="productForm.title" placeholder="Title" required class="border p-2 mb-2 w-full" />
                <input v-model="productForm.description" placeholder="Description" required
                    class="border p-2 mb-2 w-full" />
                <input v-model="productForm.category" placeholder="Category" required class="border p-2 mb-2 w-full" />
                <input v-model="productForm.price" type="number" placeholder="Price" required
                    class="border p-2 mb-2 w-full" />
                <input v-model="productForm.discountedPrice" type="number" placeholder="Discounted Price"
                    class="border p-2 mb-2 w-full" />
                <input v-model="productForm.stock" type="number" placeholder="Stock" required
                    class="border p-2 mb-2 w-full" />
                <input type="file" @change="handleFileUpload" multiple accept="image/*"
                    class="border p-2 mb-2 w-full" />

                <!-- Image Previews -->
                <div v-if="imagePreviews.length" class="mt-4">
                    <h3 class="text-lg font-semibold mb-2">Image Previews:</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="(image, index) in imagePreviews" :key="index" class="relative">
                            <img :src="image" alt="Preview" class="w-full h-32 object-cover rounded-md" />
                            <button @click="removeImage(index)"
                                class="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">×</button>
                        </div>
                    </div>
                </div>

                <button type="submit" :disabled="isSubmitting"
                    class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                    {{ editMode ? 'Update' : 'Add' }} Product
                </button>
                <button type="button" @click="cancelForm"
                    class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
            </form>
        </div>

        <!-- Product Table -->
        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Images</th>
                    <th class="py-2 px-4">Title</th>
                    <th class="py-2 px-4">Price</th>
                    <th class="py-2 px-4">Discounted Price</th>
                    <th class="py-2 px-4">Stock</th>
                    <th class="py-2 px-4">Category</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in paginatedProducts" :key="product._id" class="border-b">
                    <td class="py-2 px-4">
                        <img v-if="product.imageUrls && product.imageUrls.length" :src="product.imageUrls[0]"
                            alt="product image" class="w-16 h-16 object-cover" />
                        <span v-else>No image</span>
                    </td>
                    <td class="py-2 px-4">{{ product.title }}</td>
                    <td class="py-2 px-4">{{ formatCurrency(product.price) }}</td>
                    <td class="py-2 px-4">{{ formatCurrency(product.discountedPrice) }}</td>
                    <td class="py-2 px-4">{{ product.stock }}</td>
                    <td class="py-2 px-4">{{ product.category }}</td>
                    <td class="py-2 px-4">
                        <button @click="editProduct(product)"
                            class="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600">Edit</button>
                        <button @click="deleteProduct(product._id)"
                            class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex justify-center">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                Previous
            </button>
            <span class="mx-2 py-2">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                Next
            </button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AdminProducts',
    data() {
        return {
            products: [],
            filteredProducts: [],
            paginatedProducts: [],
            showForm: false,
            editMode: false,
            isSubmitting: false,
            productForm: {
                title: '',
                description: '',
                category: '',
                price: '',
                discountedPrice: '',
                stock: '',
                images: [] // This will hold the actual File objects
            },
            imagePreviews: [], // This holds the base64 preview URLs
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 20
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        }
    },
    methods: {
        formatCurrency(value) {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? '-' : numericValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        },
        async fetchProducts() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/products');
                const items = response.data.map(product => ({
                    ...product,
                    imageUrls: product.images.map(img => `data:${img.contentType};base64,${img.data}`)
                }));

                this.products = items;
                this.applyFilters();
            } catch (error) {
                console.error('Error fetching products:', error.response ? error.response.data : error.message);
            }
        },
        applyFilters() {
            if (this.searchQuery.trim()) {
                this.filteredProducts = this.products.filter(product =>
                    product.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    product.category.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            } else {
                this.filteredProducts = this.products;
            }
            this.currentPage = 1;
            this.paginateProducts();
        },
        paginateProducts() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            this.paginatedProducts = this.filteredProducts.slice(start, end);
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.paginateProducts();
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.paginateProducts();
            }
        },
        showAddProductForm() {
            this.showForm = true;
            this.editMode = false;
            this.resetForm();
        },
        handleFileUpload(event) {
            const files = event.target.files;
            this.productForm.images = [];
            this.imagePreviews = [];

            Array.from(files).forEach((file) => {
                this.productForm.images.push(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreviews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        },
        removeImage(index) {
            this.productForm.images.splice(index, 1);
            this.imagePreviews.splice(index, 1);
        },
        async createProduct() {
            try {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                const formData = new FormData();
                Object.keys(this.productForm).forEach((key) => {
                    if (key === 'images') {
                        this.productForm.images.forEach((image, index) => {
                            formData.append(`images[${index}]`, image);
                        });
                    } else {
                        formData.append(key, this.productForm[key]);
                    }
                });

                const response = await axios.post('https://posinet.onrender.com/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                this.products.push(response.data);
                this.applyFilters();
                this.cancelForm();
            } catch (error) {
                console.error('Error creating product:', error.response ? error.response.data : error.message);
            } finally {
                this.isSubmitting = false;
            }
        },
        async updateProduct() {
            try {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                const formData = new FormData();
                Object.keys(this.productForm).forEach((key) => {
                    if (key === 'images') {
                        this.productForm.images.forEach((image, index) => {
                            formData.append(`images[${index}]`, image);
                        });
                    } else {
                        formData.append(key, this.productForm[key]);
                    }
                });

                await axios.put(`https://posinet.onrender.com/api/product/${this.productForm._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                this.fetchProducts();
                this.cancelForm();
            } catch (error) {
                console.error('Error updating product:', error.response ? error.response.data : error.message);
            } finally {
                this.isSubmitting = false;
            }
        },
        editProduct(product) {
            this.showForm = true;
            this.editMode = true;
            this.productForm = { ...product, images: [] };
            this.imagePreviews = product.imageUrls || [];
        },
        cancelForm() {
            this.showForm = false;
            this.resetForm();
        },
        resetForm() {
            this.productForm = {
                title: '',
                description: '',
                category: '',
                price: '',
                discountedPrice: '',
                stock: '',
                images: []
            };
            this.imagePreviews = [];
            this.isSubmitting = false;
        },
        async deleteProduct(id) {
            try {
                await axios.delete(`https://posinet.onrender.com/api/product/${id}`);
                this.products = this.products.filter(product => product._id !== id);
                this.applyFilters();
            } catch (error) {
                console.error('Error deleting product:', error.response ? error.response.data : error.message);
            }
        }
    },
    created() {
        this.fetchProducts();
    }
};
</script>

<style scoped>
/* Add your styling here */
</style>