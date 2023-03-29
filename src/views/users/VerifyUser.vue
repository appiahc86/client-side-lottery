<script setup>
import {onMounted, ref, watch} from "vue";
import Button from 'primevue/button';
import {useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";

const store = useHomeStore();
const router = useRouter();
const registerError = ref('');
const verificationCode = ref(null);

const loadingInProgress = ref(false);


//on mounted hook show modal
onMounted(() => {
  if (!store.registrationPhoneNumber || !store.pass || store.token) return  router.push({name: 'home'}); //Redirect home
})



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
          password: store.pass,
          network: store.network
        })
    )

    if (response.status === 201) {
      store.user.network = store.network;
      store.user.phone = store.registrationPhoneNumber;
      store.user.balance = 0;
      store.clearRegistrationData();
      store.setToken(response.data.token);

      router.push({name: 'home'});
    }


  }catch (e) {
    if (e.response) return registerError.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return registerError.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }

    return registerError.value = 'Sorry, something went wrong. Please try again later';

  }finally { loadingInProgress.value = false; }

}


</script>

<template>

          <div class="container-fluid mt-5">
            <div class="row justify-content-center">
              <div class="col-md-6 col-lg-5 col-xl-4 mt-5">

                <h3 style="float: right; margin-left: 10px; width: 30px; cursor: pointer"
                        class="text-danger border-0 float-end"
                        @click="router.push({name: 'home'})" title="Close">X</h3>&nbsp;
                <br><br>

      <div class="card shadow p-4">
        <h6>Please Enter Verification Code Sent To Your Phone</h6>
        <template v-if="registerError">
          <p class="text-danger text-center mt-2" id="errorMessage">{{ registerError }}</p>
        </template>
        <form @submit.prevent="registerUser">
          <input type="tel" class="form-control shadow-none" maxlength="6" v-model.number="verificationCode"
                 @input="validateNumber">
          <br>
          <div class="text-center">
            <Button label="Verify" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                    class="p-button  p-button-rounded mt-2"/>
          </div>
        </form>
      </div>


  </div>
  </div>
  </div>

  <div class="d-none d-sm-block" style="margin-top: 200px;"></div>
</template>


<style scoped>

</style>