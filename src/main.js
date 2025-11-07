// Import Vue core and router
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/theme.css'
import './styles/tokens.css'
import { createPinia } from 'pinia'

// Create the app and register the router
const app = createApp(App)
app.use(createPinia())
app.use(router)

// Mount the app to the #app element in index.html
app.mount('#app')
