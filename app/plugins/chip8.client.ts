import { defineNuxtPlugin } from '#app'
import { init, type Chip8Wasm } from '@deanrumsby/libchip8'

export default defineNuxtPlugin((nuxtApp) => {
    const chip8 = shallowRef<Chip8Wasm | null>(null)
    const chip8Ready = computed(() => chip8.value !== null)

    init().then(instance => {
        chip8.value = instance
    })

    nuxtApp.provide('chip8', chip8)
    nuxtApp.provide('chip8Ready', chip8Ready)
})
