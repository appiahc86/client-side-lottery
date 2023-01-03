<script setup>
import {onMounted, ref, watch} from "vue";
import Button from 'primevue/button';
import {onBeforeRouteLeave, useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "../../store/home.js";

const store = useHomeStore();

const router = useRouter();
const dialog = ref();
const registerError = ref('');
const verificationCode = ref(null);

const loadingInProgress = ref(false);


//Close form
const closeForm = () => {
  dialog.value.close();
  router.push({name: 'home'})
}

//on mounted hook show modal
onMounted(() => {
  if (!store.registrationPhoneNumber || !store.pass || store.token) return  router.push({name: 'home'}); //Redirect home
  dialog.value.showModal();
  dialog.value.addEventListener('cancel', (e) => e.preventDefault());
})

onBeforeRouteLeave(() => store.clearRegistrationData()); //on route leave clear verification data from store


//Validate input
const validateNumber = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}

//watch verification code if it matches the one in session storage
watch(() => verificationCode.value, async (value) => {
  if (value === store.verificationCode) await registerUser();
})


//..............Register..................
const registerUser = async () => {

  try {
    //Validation
    if (verificationCode.value !== store.verificationCode)
      return registerError.value = "Sorry! you entered a wrong verification code";

    loadingInProgress.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/auth/register',
        JSON.stringify({
          phoneNumber: store.registrationPhoneNumber,
          password: store.pass
        })
    )

    if (response.status === 201) {
      store.clearRegistrationData();
      store.setToken(response.data.token);

      router.push({name: 'home'});
      return toast.add({severity:'success', summary: 'Congrats!', detail:'Registration was successful', life: 4000});
    }


  }catch (e) {
    if (e.response) return registerError.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return registerError.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }

    console.log(e)
    return registerError.value = 'Sorry, something went wrong. Please try again later';

  }finally { loadingInProgress.value = false; }

}


</script>

<template>
  <dialog ref="dialog" id="myDialog" class="border-0 p-1">
    <button style="float: right; margin-left: 10px; width: 30px;" class="text-white bg-danger border-0 fw-bold"
            @click="closeForm" title="Close">X</button>
    You may click on the close button to exit this page
    <br><br>

      <div class="card shadow p-4">
        <h6>Please Enter Verification Code Sent To Your Phone</h6>
        <template v-if="registerError">
          <p class="text-danger text-center mt-2" id="errorMessage">{{ registerError }}</p>
        </template>
        <form @submit.prevent="registerUser">
          <input type="tel" class="form-control shadow-none" maxlength="6" v-model.number="verificationCode"
                 @input="validateNumber">

          <div class="text-center">
            <Button label="Verify" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                    class="p-button  p-button-rounded mt-2"/>
          </div>
        </form>
      </div>
  </dialog>

  <div style="margin-bottom: 600px;"></div>
</template>


<style scoped>
@media screen and (min-width: 500px) {
  #myDialog {
    width: 500px;
  }
  #errorMessage {
    max-width: 500px;
  }
}
</style>