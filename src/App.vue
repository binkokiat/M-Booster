<template>
  <v-app id="inspire">
    <!-- Loading -->
    <v-dialog v-model="loading" width="80%">
      <loader></loader>
    </v-dialog>
    <NavBar
      v-if="$router.currentRoute.name !== null"
      :currentRoute="$router.currentRoute.name"
    />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Loader from "./components/Loader";
import NavBar from "./components/NavBar";

export default {
  components: {
    Loader,
    NavBar,
  },
  data() {
    return {}
  },
  computed: {
    loading() {
      return this.$store.state.loading;
    }
  },
  mounted() {
    this.checkInternet()
  },
  methods: {
    checkInternet () {
      setInterval(() => {
        this.$store.dispatch('checkInternet')
      }, 2000)
    },
  },
};
</script>
<style scoped>
@import "assets/style/main.css";
.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
  opacity: 0;
}
</style>