<template>
  <div id="app">
    <Header v-if="isLoggedIn" />
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from './components/HeaderPage.vue';

export default {
  components: {
    Header
  },
  computed: {
    ...mapGetters(['isLoggedIn'])
  }
};
</script>

<style scoped>
body {
  padding-top: 50px;
  /* Adjust this based on your header height */
}
</style>
