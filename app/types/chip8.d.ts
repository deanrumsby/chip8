export { } // ensures this file is a module

declare module '#app' {
    interface NuxtApp {
        $chip8: import('vue').ShallowRef<import('@deanrumsby/libchip8').Chip8Wasm | null>
        $chip8Ready: import('vue').ComputedRef<boolean>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $chip8: import('vue').ShallowRef<import('@deanrumsby/libchip8').Chip8Wasm | null>
        $chip8Ready: import('vue').ComputedRef<boolean>
    }
}