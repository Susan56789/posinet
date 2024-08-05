<template>
  <div id="app">
    <Header v-if="isLoggedIn" />
    <router-view />
  </div>
</template>

<script>

import Header from './components/HeaderPage.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  components: {
    Header
  },
  setup() {
    const store = useStore();
    const isLoggedIn = computed(() => store.getters.isLoggedIn);
    return { isLoggedIn };
  }
};
</script>

<style scoped>
body {
  padding-top: 50px;
  /* Adjust this based on your header height */
}
</style>
