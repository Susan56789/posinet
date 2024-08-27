<template>
    <div class="manage-products">
        <h1 class="text-2xl font-bold mb-4">Manage Products</h1>
        <button @click="showAddProductForm" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">
            Add Product
        </button>

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
                    <h3 class="text-lg font-semibold mb-2">Image Preview:</h3>
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
                <tr v-for="product in products" :key="product._id" class="border-b">
                    <td class="py-2 px-4">
                        <img v-if="product.imageUrl" :src="product.imageUrl" alt="product image"
                            class="w-16 h-16 object-cover" />
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
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'AdminProducts',
    data() {
        return {
            products: [],
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
            imagePreviews: []
        };
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
                    imageUrl: product.images && product.images.length > 0
                        ? `data:${product.images[0].contentType};base64,${product.images[0].data}`
                        : null
                }));

                // Sort the items by createdAt date in descending order (newest first)
                items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Take only the first 10 items (latest 10)
                this.products = items.slice(0, 10);
            } catch (error) {
                console.error('Error fetching products:', error);
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
                // Push the actual file to the images array
                this.productForm.images.push(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    // Push the base64 image preview to the previews array
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
                if (this.isSubmitting) return; // Prevent double submission
                this.isSubmitting = true; // Disable the form

                const formData = new FormData();
                formData.append('title', this.productForm.title);
                formData.append('description', this.productForm.description);
                formData.append('price', this.productForm.price);
                formData.append('stock', this.productForm.stock);
                formData.append('category', this.productForm.category);

                if (this.productForm.discountedPrice) {
                    formData.append('discountedPrice', this.productForm.discountedPrice); // Optional field
                }

                this.productForm.images.forEach((image) => {
                    formData.append('images', image); // Add each image file to FormData
                });

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing.');

                const response = await axios.post('https://posinet.onrender.com/api/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.product) {
                    alert('Product added successfully!');
                    this.fetchProducts();
                    this.cancelForm();
                } else {
                    throw new Error(response.data.message || 'Failed to add product.');
                }
            } catch (error) {
                console.error('Error creating product:', error);
                alert('Failed to add product. Error: ' + (error.response?.data?.message || error.message));
            } finally {
                this.isSubmitting = false;
            }
        },
        editProduct(product) {
            this.showForm = true;
            this.editMode = true;
            this.productForm = {
                ...product,
                images: []
            };
            this.imagePreviews = product.imageUrl ? [product.imageUrl] : [];
        },
        async updateProduct() {
            try {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                const formData = new FormData();
                formData.append('title', this.productForm.title);
                formData.append('description', this.productForm.description);
                formData.append('price', this.productForm.price);
                formData.append('stock', this.productForm.stock);
                formData.append('category', this.productForm.category);

                // Add discountedPrice to FormData
                if (this.productForm.discountedPrice) {
                    formData.append('discountedPrice', this.productForm.discountedPrice);
                }

                this.productForm.images.forEach((image) => {
                    formData.append('images', image);
                });

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing.');

                const response = await axios.put(`https://posinet.onrender.com/api/product/${this.productForm._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data) {
                    alert('Product updated successfully!');
                    this.fetchProducts();
                    this.cancelForm();
                } else {
                    throw new Error('Failed to update product.');
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Error: ' + (error.response?.data?.message || error.message));
            } finally {
                this.isSubmitting = false;
            }
        },
        async deleteProduct(productId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing.');

                const response = await axios.delete(`https://posinet.onrender.com/api/product/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    alert('Product deleted successfully!');
                    this.fetchProducts();
                } else {
                    throw new Error('Failed to delete product.');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product. Error: ' + error.message);
            }
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
        }
    },
    mounted() {
        this.fetchProducts();
    }
};
</script>