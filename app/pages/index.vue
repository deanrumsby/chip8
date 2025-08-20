<script setup lang="ts">
const { $chip8, $chip8Ready } = useNuxtApp()

const program = ref<Uint8Array>(new Uint8Array());
const fileInput = ref<HTMLInputElement | null>(null);
const disassembly = ref<string | null>(null);

function openFilePicker() {
    fileInput.value?.click();
}

function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (!$chip8.value) return;
        const arrayBuffer = e.target?.result as ArrayBuffer;
        program.value = new Uint8Array(arrayBuffer);
        console.log('Loaded program bytes:', program.value);

        disassembly.value = $chip8.value.disassemble(program.value);
    };
    reader.readAsArrayBuffer(file);
}
</script>

<template>
    <div class="p-3">
        <UButton
            :disabled="!$chip8Ready"
            @click="openFilePicker"
        >
            Load & Disassemble Program
        </UButton>

        <input
            ref="fileInput"
            type="file"
            accept="*/*"
            style="display: none"
            @change="handleFileSelect"
        >

        <p v-if="!$chip8Ready">Loading CHIP-8...</p>

        <DisassemblyViewer
            v-if="disassembly"
            :disassembly="disassembly"
        />
    </div>
</template>