<template>
  <div id="app">
    <Header v-if="!isAdminRoute" />
    <router-view />
  </div>
</template>

<script>

import Header from './components/HeaderPage.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  components: {
    Header
  },
  setup() {
    const route = useRoute();
    const isAdminRoute = computed(() => {
      return route.matched.some(record => record.meta.role === 'admin');
    });

    return {
      isAdminRoute
    };

  }
};
</script>

<style scoped>
body {
  padding-top: 50px;
  /* Adjust this based on your header height */
}
</style>
