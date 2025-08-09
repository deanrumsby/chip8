<script setup lang="ts">
const { $chip8, $chip8Ready } = useNuxtApp()

function handleClick() {
  $chip8.value?.add(2, 3)
}
</script>

<template>
  <button :disabled="!$chip8Ready" @click="handleClick">
    Add
  </button>
  <p v-if="!$chip8Ready">Loading CHIP-8...</p>
</template>
