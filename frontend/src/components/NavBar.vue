<!-- src/components/NavBar.vue -->
<template>
    <div>
        <nav>
            <ul>
                <li><router-link to="/sales">Sales</router-link></li>
                <li><router-link to="/customers">Customers</router-link></li>
                <li><router-link to="/suppliers">Suppliers</router-link></li>
                <li><router-link to="/inventory">Inventory</router-link></li>
                <li><router-link to="/item-repair">Item Repair</router-link></li>
                <li><router-link to="/expenses">Expenses</router-link></li>
                <li><router-link to="/reports">Reports</router-link></li>
            </ul>
        </nav>
    </div>
</template>

<script>
export default {
};
</script>