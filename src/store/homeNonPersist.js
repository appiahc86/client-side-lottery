import { defineStore } from 'pinia'
import moment from "moment";


// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application


export const useHomeNonPersistStore = defineStore('homeNonPersistStore', {
    state: () => {
        return {
            drawResults: [],
            images: [],
            date: moment()
        }
    },

    getters: {
        getDrawResults: (state) => state.drawResults.length ? JSON.parse(state.drawResults[0].numbers) : [],
        getImages: (state) => state.images,
        getDate: (state) => state.date,
    },

    actions: {
        //Set draw results
        setDrawResults(payload){ this.drawResults = payload },

        //set images
        setImages(payload){ this.images = payload },

        //set day
        setDate(payload){ this.date = payload },

    },

})