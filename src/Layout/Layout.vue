<template>
  <main class="app-wrapper">
    <NavbarComponent/>
    <!-- end header -->
    <!-- <Settings />-->

    <div>
      <!-- <Breadcrumbs v-if="!$route.meta.hide" /> -->
      <router-view v-slot="{ Component }">
          <component :is="Component"></component>
      </router-view>
    </div>
    <!-- end page content -->
    <!-- <FooterMenu v-if="window.width < 768" /> -->
  </main>
</template>

<script lang="ts">
import NavbarComponent from "@/components/Navbar/NavbarComponent.vue";

export default {
  name: 'LayoutApp',
  components: {
    NavbarComponent,
  },
  methods: {
  },
};
</script>

<style lang="scss">
/* Adicione seus estilos SCSS aqui, se necessário */
</style>
