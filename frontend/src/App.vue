<template>
  <div id="app">
    <Header v-if="!isAdminRoute && isUserLoggedIn" />
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Header from './components/HeaderPage.vue';

export default {
  components: {
    Header
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const isAdminRoute = computed(() => {
      return route.matched.some(record => record.meta.role === 'admin');
    });

    const isUserLoggedIn = computed(() => store.getters.isLoggedIn);

    return {
      isAdminRoute,
      isUserLoggedIn
    };
  }
};
</script>
