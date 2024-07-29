<template>
  <div id="app">
    <Header v-if="isLoggedIn" />
    <router-view />
  </div>
</template>

<script>
import Header from './components/HeaderPage.vue';

export default {
  components: {
    Header
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  }
};
</script>

<style>
body {
  padding-top: 50px;
  /* Adjust this based on your header height */
}
</style>
