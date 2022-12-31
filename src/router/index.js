import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import userRoutes from "./users/index.js"

import {useHomeStore} from "../store/home.js";


const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/about',
        name: 'about',
        component: About
    },

    //Load imported routes
    ...userRoutes,

//    redirect to home page if route not found
    {
        path: '/:catchAll(.*)*',
        redirect: {name: 'home'}
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 }
        }
    }

})


router.beforeEach((to, from) => {
    const store = useHomeStore();
    if (to.meta.requiresAuth && !store.token) {
        return {
            name: 'register-login',
            // save the location we were at to come back later
            query: { redirect: to.fullPath },
        }
    }
})


export default router;