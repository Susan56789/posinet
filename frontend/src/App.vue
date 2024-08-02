<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script>

import Header from './components/HeaderPage.vue';

export default {
  components: {
    Header
  }
};
</script>

<style scoped>
body {
  padding-top: 50px;
  /* Adjust this based on your header height */
}
</style>
