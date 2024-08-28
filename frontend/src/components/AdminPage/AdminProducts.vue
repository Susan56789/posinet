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
                <div>
                    <!-- Image Upload Section -->
                    <label for="images-input" class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                    <div class="flex items-center justify-center w-full">
                        <label for="images-input"
                            class="flex flex-col w-full h-32 border-4 border-dashed border-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-300">
                            <div class="flex flex-col items-center justify-center pt-7">
                                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                                <p class="text-sm text-gray-500">
                                    <span class="font-semibold">Click to upload</span> or drag and drop
                                </p>
                            </div>
                            <input id="images-input" type="file" multiple class="hidden"
                                accept="image/png, image/jpeg, image/webp" @change="handleFileUpload" />
                        </label>
                    </div>

                    <!-- Image Preview Section -->
                    <div v-if="imagePreviews.length" class="mt-4">
                        <h3 class="text-lg font-semibold mb-2">Image Preview:</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div v-for="(image, index) in imagePreviews" :key="index" class="relative">
                                <img :src="image" alt="Preview" class="w-full h-32 object-cover rounded-md" />
                                <button @click="removeImage(index)"
                                    class="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">×</button>
                            </div>
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
                images: []
            },
            imagePreviews: [],
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
            const query = this.searchQuery.trim().toLowerCase();
            this.filteredProducts = query
                ? this.products.filter(product =>
                    product.title.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query))
                : this.products;

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
            const files = Array.from(event.target.files);
            this.productForm.images = files;

            this.imagePreviews = files.map(file => URL.createObjectURL(file));
        },
        removeImage(index) {
            this.productForm.images.splice(index, 1);
            this.imagePreviews.splice(index, 1);
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
        },
        async createProduct() {
            this.isSubmitting = true;
            try {
                const formData = new FormData();
                Object.keys(this.productForm).forEach(key => {
                    if (key === 'images') {
                        this.productForm.images.forEach(image => formData.append('images', image));
                    } else {
                        formData.append(key, this.productForm[key]);
                    }
                });

                await axios.post('https://posinet.onrender.com/api/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                this.showForm = false;
                this.fetchProducts();
            } catch (error) {
                console.error('Error creating product:', error.response ? error.response.data : error.message);
            } finally {
                this.isSubmitting = false;
            }
        },
        editProduct(product) {
            this.showForm = true;
            this.editMode = true;
            this.productForm = { ...product, images: [] };
            this.imagePreviews = product.imageUrls;
        },
        async updateProduct() {
            this.isSubmitting = true;
            try {
                const formData = new FormData();
                Object.keys(this.productForm).forEach(key => {
                    if (key === 'images') {
                        this.productForm.images.forEach(image => formData.append('images', image));
                    } else {
                        formData.append(key, this.productForm[key]);
                    }
                });

                await axios.put(`https://posinet.onrender.com/api/products/${this.productForm._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                this.showForm = false;
                this.fetchProducts();
            } catch (error) {
                console.error('Error updating product:', error.response ? error.response.data : error.message);
            } finally {
                this.isSubmitting = false;
            }
        },
        async deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await axios.delete(`https://posinet.onrender.com/api/products/${productId}`);
                    this.fetchProducts();
                } catch (error) {
                    console.error('Error deleting product:', error.response ? error.response.data : error.message);
                }
            }
        },
        cancelForm() {
            this.showForm = false;
            this.resetForm();
        }
    },
    mounted() {
        this.fetchProducts();
    }
};
</script>
