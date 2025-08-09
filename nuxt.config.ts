// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  vite: {
    server: {
      fs: {
        allow: [
          '..', // existing allowed dirs
          '/Users/dean/Code/libchip8/pkg' // absolute path to your linked package
        ]
      }
    }
  },
  typescript: {
    typeCheck: true
  }
})