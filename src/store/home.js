import { defineStore } from 'pinia'
import { ref } from "vue";
import { parse, stringify,  } from 'zipson';

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useHomeStore = defineStore('homeStore', () => {
    const registrationPhoneNumber = ref(null);
    const pass = ref('');
    const verificationNumber = ref(null);
    const setRegistrationData = (num, password, vNumber) => {
        registrationPhoneNumber.value = num;
        pass.value = password;
        verificationNumber.value = vNumber
    }
    const clearRegistrationData = () => {
        registrationPhoneNumber.value = null;
        pass.value = '';
        verificationNumber.value = null
    }


    return {
        registrationPhoneNumber,
        pass,
        verificationNumber,
        setRegistrationData,
        clearRegistrationData }
},
    {persist: {
        key: '_loda',
            storage: sessionStorage,
            paths: ['registrationPhoneNumber', 'pass', 'verificationNumber'],
            serializer: {
                deserialize: parse,
                serialize: stringify
            }
}}
    )