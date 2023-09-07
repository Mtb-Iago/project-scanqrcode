<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="main">
    <HelloWorld msg="You did it!" />
  </div>
</template>

<style scoped>
.main {
  overflow: hidden;
  display: flex;
  align-items: start;
  justify-content: center;
  text-align: center;
  
  /* width: min-content; */
  height: 100vh;
  background-color: rgb(200, 19, 19);
}

</style>
