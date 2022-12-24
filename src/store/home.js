import { defineStore } from 'pinia'
import {computed, reactive, ref} from "vue";
import { parse, stringify,  } from 'zipson';

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useHomeStore = defineStore('homeStore', () => {
    const registrationPhoneNumber = ref(null);
    const pass = ref('');
    const setRegistrationData = (num, password) => {
        registrationPhoneNumber.value = num;
        pass.value = password;
    }
    const clearRegistrationData = () => {
        registrationPhoneNumber.value = null;
        pass.value = '';
    }


    return {
        registrationPhoneNumber,
        pass,
        setRegistrationData,
        clearRegistrationData }
},
    {persist: {
        key: '_loda',
            storage: sessionStorage,
            paths: ['registrationPhoneNumber', 'pass'],
            serializer: {
                deserialize: parse,
                serialize: stringify
            }
}}
    )