import { defineStore } from 'pinia'
// import { ref } from "vue";
import { parse, stringify,  } from 'zipson';

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
// export const useHomeStore = defineStore('homeStore', () => {
//     const registrationPhoneNumber = ref(null);
//     const pass = ref('');
//     const verificationCode = ref(null);
//     const user = ref(null);
//     const token = ref('');
//
//     //Set registration data
//     function setRegistrationData (num, password, vCode){
//         registrationPhoneNumber.value = num;
//         pass.value = password;
//         verificationCode.value = vCode;
//     }
//         //Set registration data
//     function clearRegistrationData(){
//         registrationPhoneNumber.value = null;
//         pass.value = '';
//         verificationCode.value = null
//     }
//
//     //Set Token
//     function setToken(payload){
//       token.value = payload
//     }
//
//
//
//     return {
//         registrationPhoneNumber,
//         pass,
//         verificationCode,
//         setRegistrationData,
//         clearRegistrationData,
//         setToken,
//     }
// },
//     {persist: {
//         key: '_loda',
//             storage: sessionStorage,
//             // paths: ['registrationPhoneNumber', 'pass', 'verificationCode', 'token'],
//             serializer: {
//                 deserialize: parse,
//                 serialize: stringify
//             }
// }}
//
// )



export const useHomeStore = defineStore('homeStore', {
    state: () => {
        return {
            registrationPhoneNumber: null,
            pass: "",
            verificationCode: null,
            user: null,
            token: ""
         }
    },

    getters: {

    },

    actions: {

      //Set registration data
     setRegistrationData (num, password, vCode){
        this.registrationPhoneNumber = num;
        this.pass = password;
        this.verificationCode = vCode;
    },

        //Clear registration data
     clearRegistrationData(){
        this.registrationPhoneNumber = null;
        this.pass = '';
        this.verificationCode = null
    },

        //Set Token
     setToken(payload){ this.token = payload },

       //Clear Token
     clearToken(){ this.token = "" }

    },

    persist: {
       key: '_loda',
            storage: sessionStorage,
            paths: ['registrationPhoneNumber', 'pass', 'verificationCode', 'token'],
            serializer: {
                deserialize: parse,
                serialize: stringify
            }
        },

})