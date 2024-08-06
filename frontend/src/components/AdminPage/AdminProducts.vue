<template>
    <div class="manage-products">
        <h1 class="text-2xl font-bold mb-4">Manage Products</h1>
        <button @click="showAddProductForm" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">Add
            Product</button>

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
                <input type="file" @change="handleFileUpload" :required="!editMode" class="border p-2 mb-2 w-full" />
                <button type="submit" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">{{ editMode ?
            'Update' : 'Add' }} Product</button>
                <button type="button" @click="cancelForm"
                    class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
            </form>
        </div>

        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Title</th>
                    <th class="py-2 px-4">Image</th>
                    <th class="py-2 px-4">Price</th>
                    <th class="py-2 px-4">Stock</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product._id" class="border-b">
                    <td class="py-2 px-4">{{ product.title }}</td>
                    <td class="py-2 px-4"><img :src="product.image" alt="product image"
                            class="w-16 h-16 object-cover" /></td>
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
                image: null
            }
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
            const file = event.target.files[0];
            if (file) {
                this.productForm.image = file;
            } else {
                console.error('No file selected');
            }
        },
        async createProduct() {
            const formData = new FormData();
            formData.append('title', this.productForm.title);
            formData.append('description', this.productForm.description);
            formData.append('price', this.productForm.price);
            formData.append('stock', this.productForm.stock);
            if (this.productForm.image) {
                formData.append('image', this.productForm.image);
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('https://posinet.onrender.com/api/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.products.push(response.data);
                this.cancelForm();
            } catch (error) {
                console.error('Error creating product:', error.response ? error.response.data : error.message);
                // Handle error (e.g., show error message to user)
            }
        },
        editProduct(product) {
            this.showForm = true;
            this.editMode = true;
            this.productForm = { ...product, image: null };
        },
        async updateProduct() {
            const formData = new FormData();
            formData.append('title', this.productForm.title);
            formData.append('description', this.productForm.description);
            formData.append('price', this.productForm.price);
            formData.append('stock', this.productForm.stock);
            if (this.productForm.image) {
                formData.append('image', this.productForm.image);
            }

            try {
                const token = localStorage.getItem('token');
                await axios.put(`https://posinet.onrender.com/api/products/${this.productForm._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.fetchProducts();
                this.cancelForm();
            } catch (error) {
                console.error('Error updating product:', error);
            }
        },
        async deleteProduct(productId) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://posinet.onrender.com/api/products/${productId}`, {
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
                image: null
            };
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
