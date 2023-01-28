<script setup>
import {onMounted, reactive, ref} from "vue";
import Button from 'primevue/button';
import {onBeforeRouteLeave, useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";

const showNewPasswordForm = ref(false);
const store = useHomeStore();
const closeModal = ref();
const openModal = ref();
const router = useRouter();
const error = ref('');
const loadingInProgress = ref(false);

const formData = reactive({phoneNumber: null});
const resetPasswordData = reactive({
  phoneNumber: null, password: null, password_confirmation: null,
  validateRequestCode: "9#45$!", passwordResetCode: null
})


//on mounted hook show modal
onMounted(() => {
  if (store.token) return router.push({name: 'home'});//Redirect home
  openModal.value.click();
})

onBeforeRouteLeave((to, from, next) => { //on route leave clear verification data from store
  closeModal.value.click();
  next();
});


//Validate input
const validateNumber = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}



//..............request code..................
const requestCode = async () => {

  try {
    //Validation
    if (formData.phoneNumber.toString().length !== 9) return error.value = "Please check the phone number";


    loadingInProgress.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/auth/password-reset-code',
        JSON.stringify({
          phoneNumber: formData.phoneNumber
        })
    )

    if (response.status === 200) {
      resetPasswordData.phoneNumber = formData.phoneNumber;
      showNewPasswordForm.value = true;
      error.value = '';
    }


  }catch (e) {
    if (e.response) return error.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return error.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }

    return error.value = 'Sorry, something went wrong. Please try again later';

  }finally { loadingInProgress.value = false; }

}




//...........Reset Password.................
const resetPassword = async () => {
  try {

    loadingInProgress.value = true;

    const regex = /^(?=.{6,})(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])/

    //Validation
    if (resetPasswordData.phoneNumber.toString().length  !== 9) return error.value = "Please check phone number";
    if (!resetPasswordData.password.trim()) return error.value = "Please provide a password";
    if (!resetPasswordData.password.match(regex)) return error.value = "Minimum password length should be 6 and contains at least 1 special character";
    if (resetPasswordData.password !== resetPasswordData.password_confirmation) return error.value = "Passwords do not match";
    if (!resetPasswordData.passwordResetCode) return error.value = "Please input the code sent to your phone";

    //Send Data To Server
    const response = await  axios.post(
        '/users/auth/reset-password',
        JSON.stringify({
          ...resetPasswordData, password_confirmation: undefined,
        }),
    )

    if (response.status === 200) {
      toast.add({severity:'success', summary: 'Success', detail: "password reset was successful. You may login now", life: 4000});
      return router.push({name: 'register-login'});
    }


  }catch (e) {
    if (e.response) return error.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return error.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }

    return error.value = 'Sorry, something went wrong. Please try again later';
  }finally { loadingInProgress.value = false; }
}

</script>

<template>

  <!--  this button launches the modal -->
  <button type="button" ref="openModal" class="d-none mt-5 mb-5" data-bs-toggle="modal" data-bs-target="#authModal"></button>

  <!-- Modal -->
  <div class="modal" id="authModal" tabindex="-1" data-bs-keyboard="false" aria-labelledby="authModal" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body">
          <div class="container-fluid mt-3">
            <div class="row justify-content-center">
              <div class="col-md-6 col-lg-5 col-xl-4 mt-5">

                <button style="float: right; margin-left: 10px; width: 30px;"
                        class="text-white bg-danger border-0 fw-bold float-end"
                        @click="router.push({name: 'home'})" title="Close">X</button>&nbsp;
                <span class="float-end">Click here to close </span>

                <br><br>

                <div class="card shadow p-4">
                  <h6 v-if="showNewPasswordForm">Create a new password</h6>
                  <h6 v-else>Please Enter Your Phone</h6>
                  <template v-if="error">
                    <p class="text-danger text-center mt-2" id="errorMessage">{{ error }}</p>
                  </template>

                  <form @submit.prevent="resetPassword" v-if="showNewPasswordForm">

                      <input type="password" class="form-control mb-3 shadow-none" placeholder="Create New Password"
                            required v-model="resetPasswordData.password">
                    <input type="password" class="form-control mb-3 shadow-none" placeholder="Confirm Password"
                           required v-model="resetPasswordData.password_confirmation">
                    <input type="tel" class="form-control shadow-none" maxlength="8" placeholder="code (check phone sms)"
                           @input="validateNumber" required v-model.number="resetPasswordData.passwordResetCode">



                    <div class="text-center">
                      <Button label="Submit" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                              class="p-button  p-button-rounded mt-3"/>
                    </div>
                  </form>

                  <form @submit.prevent="requestCode" v-else>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <div class="input-group-text">+233</div>
                      </div>
                      <input type="tel" class="form-control shadow-none" maxlength="10" v-model.number="formData.phoneNumber"
                             @input="validateNumber" required>
                    </div>


                    <div class="text-center">
                      <Button label="Submit" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                              class="p-button  p-button-rounded mt-3"/>
                    </div>
                  </form>
                </div>


              </div>
            </div>
          </div>

          <!-- this button closes the modal -->
          <button type="button" class="d-none" data-bs-dismiss="modal" ref="closeModal"></button>
        </div>
      </div>
    </div>
  </div>
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