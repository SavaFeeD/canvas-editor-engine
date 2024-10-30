<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="logo">
      <icon-tooling></icon-tooling>
    </div>

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 35px;
  font-size: 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
