<template>
    <div>
        <h1>Login</h1>
        <form @submit.prevent="login">
            <input v-model="email" placeholder="Email" />
            <input v-model="password" type="password" placeholder="Password" />
            <button type="submit">Login</button>
        </form>
        <p v-if="error">{{ error }}</p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AuthPage',
    data() {
        return {
            email: '',
            password: '',
            error: ''
        };
    },
    methods: {
        async login() {
            try {
                const res = await axios.post('http://localhost:5000/login', {
                    email: this.email,
                    password: this.password
                });
                localStorage.setItem('token', res.data.token);
                this.$router.push('/admin');
            } catch (error) {
                this.error = 'Invalid credentials';
            }
        }
    }
};
</script>