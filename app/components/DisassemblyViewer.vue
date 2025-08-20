<script setup lang="ts">
type DisassemblyViewerProps = {
    disassembly: string,
}

const PROG_START = 0x200;
const INSTRUCTION_BYTE_LENGTH = 2;

const { disassembly } = defineProps<DisassemblyViewerProps>();

const transformed = computed<[number, string][]>(() => {
    const lines = disassembly.split('\n');
    return lines.map((line, index) => ([
        PROG_START + (index * INSTRUCTION_BYTE_LENGTH),
        line,
    ]));
});

</script>

<template>
    <div class="mt-2 p-2 w-xl h-full bg-hp48-screen rounded-xl border-2 border-black">
        <div
            v-for="([offset, line], index) in transformed"
            :key="index"
            class="flex gap-6"
        >
            <div>
                {{ offset.toString(16).padStart(4, '0') }}:
            </div>
            <div>
                {{ line }}
            </div>
        </div>
    </div>
</template>