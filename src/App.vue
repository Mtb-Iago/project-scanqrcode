<template>
  <main class="app-wrapper">
    <NavBar />
    <router-view />
  </main>
</template>

<script lang="ts">
import NavBar from "@/components/Navbar/NavBar.vue";

export default {
  components: {
    NavBar,
  },
  methods: {
  },
};
</script>

<style>
/* Adicione seus estilos SCSS aqui, se necessário */
</style>
