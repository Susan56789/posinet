<template>
    <footer class="bg-gradient-to-r from-gray-100 via-[#bce1ff] to-gray-100 py-6">
        <div class="max-w-screen-xl px-4 mx-auto text-center">
            <!-- Logo -->
            <img src="/assets/logo-dark1.png" class="mx-auto h-10 sm:h-10" alt="posiweb logo" />

            <!-- Copyright -->
            <p class="mt-4 text-xs text-gray-800">
                © {{ currentYear }} Posinet. All rights reserved.
            </p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'FooterPage',
    data() {
        return {
            currentYear: new Date().getFullYear()
        };
    }
}
</script>

<style scoped>
/* Add any additional custom styles here if necessary */
</style>
