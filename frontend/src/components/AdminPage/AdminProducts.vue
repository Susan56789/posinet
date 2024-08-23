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
                <input v-model="productForm.price" type="number" placeholder="Price" required
                    class="border p-2 mb-2 w-full" />
                <input v-model="productForm.stock" type="number" placeholder="Stock" required
                    class="border p-2 mb-2 w-full" />
                <input type="file" @change="handleFileUpload" multiple accept="image/*"
                    class="border p-2 mb-2 w-full" />

                <!-- Image Previews -->
                <div v-if="imagePreviews.length > 0" class="flex flex-wrap gap-2 mb-2">
                    <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                        <img :src="preview" alt="Preview" class="w-24 h-24 object-cover" />
                        <button @click.prevent="removeImage(index)"
                            class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                            X
                        </button>
                    </div>
                </div>

                <button type="submit" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
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
                    <th class="py-2 px-4">Title</th>
                    <th class="py-2 px-4">Images</th>
                    <th class="py-2 px-4">Price</th>
                    <th class="py-2 px-4">Stock</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product._id" class="border-b">
                    <td class="py-2 px-4">{{ product.title }}</td>
                    <td class="py-2 px-4">
                        <div class="flex gap-2">
                            <img v-for="(image, index) in product.images" :key="index" :src="image.url"
                                alt="product image" class="w-16 h-16 object-cover" />
                        </div>
                    </td>
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
import axios from 'axios';

export default {
    name: 'AdminProducts',
    data() {
        return {
            products: [],
            showForm: false,
            editMode: false,
            productForm: {
                title: '',
                description: '',
                price: '',
                stock: '',
                images: []
            },
            imagePreviews: []
        };
    },
    methods: {
        async fetchProducts() {
            try {
                const response = await axios.get('https://posinet.onrender.com/api/products');
                this.products = response.data;
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
            const files = Array.from(event.target.files);
            this.productForm.images = files;
            this.imagePreviews = [];

            files.forEach(file => {
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
                const formData = new FormData();
                formData.append('title', this.productForm.title);
                formData.append('description', this.productForm.description);
                formData.append('price', this.productForm.price);
                formData.append('stock', this.productForm.stock);

                // Append each image file separately
                this.productForm.images.forEach((image) => {
                    formData.append(`images`, image);
                });

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing.');

                const response = await axios.post('https://posinet.onrender.com/api/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 201) {
                    alert('Product added successfully!');
                    this.fetchProducts();
                    this.cancelForm();
                } else {
                    throw new Error('Failed to add product.');
                }
            } catch (error) {
                console.error('Error creating product:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                alert('Failed to add product. Error: ');
            }
        },

        editProduct(product) {
            this.showForm = true;
            this.editMode = true;
            this.productForm = {
                ...product,
                images: [] // Reset images array
            };
            this.imagePreviews = product.images.map(img => img.filename ? `https://posinet.onrender.com/api/images/${img.filename}` : img.url);
        },

        async updateProduct() {
            const formData = new FormData();
            formData.append('title', this.productForm.title);
            formData.append('description', this.productForm.description);
            formData.append('price', this.productForm.price);
            formData.append('stock', this.productForm.stock);

            // Append each new image file separately
            this.productForm.images.forEach((image) => {
                formData.append(`images`, image);
            });

            try {
                const token = localStorage.getItem('token');
                await axios.put(`https://posinet.onrender.com/api/product/${this.productForm._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.fetchProducts();
                this.cancelForm();
                alert('Product updated successfully!');
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            }
        },
        async deleteProduct(productId) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://posinet.onrender.com/api/product/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.products = this.products.filter(product => product._id !== productId);
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        },
        resetForm() {
            this.productForm = {
                title: '',
                description: '',
                price: '',
                stock: '',
                images: []
            };
            this.imagePreviews = [];
        },
        cancelForm() {
            this.showForm = false;
            this.resetForm();
        }
    },
    mounted() {
        this.fetchProducts();
    }
}
</script>
