import { createApp } from 'vue';
import './style.css';
import router from "./router/index.js";
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import 'primevue/resources/themes/rhea/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.use(router);
app.mount('#app');
