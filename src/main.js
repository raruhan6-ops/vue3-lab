// Import Vue core and router
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/theme.css'
import './styles/tokens.css'

// Create the app and register the router
const app = createApp(App)

// Use the router (for navigation between labs)
app.use(router)

// Mount the app to the #app element in index.html
app.mount('#app')
