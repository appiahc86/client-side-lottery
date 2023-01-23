import { defineStore } from 'pinia'


// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application


export const useHomeNonPersistStore = defineStore('homeNonPersistStore', {
    state: () => {
        return {
            drawResults: [],
            images: [],
            day: new Date().getDay()
        }
    },

    getters: {
        getDrawResults: (state) => state.drawResults.length ? JSON.parse(state.drawResults[0].numbers) : [],
        getImages: (state) => state.images,
        getGameDay: (state) => state.drawResults.length ? state.drawResults[0].drawDate : null,
        getDay: (state) => state.day
    },

    actions: {
        //Set draw results
        setDrawResults(payload){ this.drawResults = payload },

        //set images
        setImages(payload){ this.images = payload },

        //set day
        setDay(payload){ this.day = payload },

    },

})