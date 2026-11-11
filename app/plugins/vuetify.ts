// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      // Vuetify 4 defaults to the OS theme ('system'); the ShopKart pages are designed for light mode.
      defaultTheme: 'light',
    },
  })
  app.vueApp.use(vuetify)
})
