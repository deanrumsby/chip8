<script setup lang="ts">
import { ref } from 'vue'

const { $chip8, $chip8Ready } = useNuxtApp()

const program = ref<Uint8Array>(new Uint8Array());
const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer;
    program.value = new Uint8Array(arrayBuffer);
    console.log('Loaded program bytes:', program.value);

    const result = $chip8.value?.disassemble(program.value);
    console.log('Disassembly result:\n', result);
  };
  reader.readAsArrayBuffer(file);
}
</script>

<template>
  <UApp>

  <button :disabled="!$chip8Ready" @click="openFilePicker">
    Load & Disassemble Program
  </button>

  <input
    ref="fileInput"
    type="file"
    accept="*/*"
    style="display: none"
    @change="handleFileSelect"
  >

  <p v-if="!$chip8Ready">Loading CHIP-8...</p>

  <div class="h-[100px] w-[100px] bg-[#53595b]">
    hi
  </div>
</UApp>
</template>
