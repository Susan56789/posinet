<template>
    <div class="admin-layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <router-link to="/" class="logo">Posinet POS</router-link>
            </div>
            <nav class="menu">
                <ul>
                    <li>
                        <router-link to="/admin" active-class="active">Dashboard</router-link>
                    </li>
                    <li>
                        <router-link to="/admin/users" active-class="active">Manage Users</router-link>
                    </li>
                    <li>
                        <router-link to="/admin/products" active-class="active">Manage Products</router-link>
                    </li>
                    <li>
                        <router-link to="/admin/permissions" active-class="active">Manage Permissions</router-link>
                    </li>
                    <li>
                        <router-link to="/admin/reports" active-class="active">View Reports</router-link>
                    </li>
                </ul>
            </nav>
        </aside>
        <div class="main-content">
            <header class="header">
                <div class="header-content">
                    <h1>{{ $route.meta.title }}</h1>
                    <button @click="logout" class="logout-btn">Logout</button>
                </div>
            </header>
            <main>
                <router-view></router-view>
            </main>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminLayout',
    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userName');
            localStorage.removeItem('email');
            this.$router.push('/login/admin');
        }
    }
};
</script>

<style scoped>
.admin-layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 240px;
    background-color: #2d3748;
    color: white;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 20px;
    background-color: #1a202c;
}

.logo {
    color: white;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: bold;
}

.menu {
    flex: 1;
    padding: 20px 0;
}

.menu ul {
    list-style: none;
    padding: 0;
}

.menu li {
    margin: 0;
}

.menu a {
    display: block;
    padding: 15px 20px;
    color: white;
    text-decoration: none;
    font-size: 1rem;
}

.menu a.active,
.menu a:hover {
    background-color: #4a5568;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.header {
    background-color: #f7fafc;
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logout-btn {
    background-color: #e53e3e;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.logout-btn:hover {
    background-color: #c53030;
}

main {
    flex: 1;
    padding: 20px;
    background-color: #edf2f7;
}
</style>