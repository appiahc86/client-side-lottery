<script setup>
import {onMounted, reactive, ref} from "vue";
import Button from 'primevue/button';
import {useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";

const showNewPasswordForm = ref(false);
const store = useHomeStore();
const router = useRouter();
const error = ref('');
const loadingInProgress = ref(false);
const showPassword = ref(false)

const formData = reactive({phoneNumber: null});
const resetPasswordData = reactive({
  phoneNumber: null, password: null, password_confirmation: null,
  validateRequestCode: "9#45$!", passwordResetCode: null
})


//on mounted hook show modal
onMounted(() => {
  if (store.token) return router.push({name: 'home'});//Redirect home
})


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
    error.value = '';

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    //Validation
    if (resetPasswordData.phoneNumber.toString().length  !== 9) return error.value = "Please check phone number";
    if (!resetPasswordData.password.trim()) return error.value = "Please provide a password";
    if (!resetPasswordData.password.match(regex)) return error.value = "Password does not meet requirements";
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

          <div class="container-fluid mt-5">
            <div class="row justify-content-center">
              <div class="col-md-6 col-lg-5 col-xl-4 mt-5">

                <h3 style="float: right; margin-left: 10px; width: 30px; cursor: pointer;"
                        class="text-danger border-0 float-end"
                        @click="router.push({name: 'home'})" title="Close">X</h3>&nbsp;
                <br><br>

                <div class="card shadow p-4">
                  <h6 v-if="showNewPasswordForm">Create a new password</h6>
                  <h6 v-else>Please Enter Your Phone</h6>
                  <template v-if="error">
                    <p class="text-danger text-center mt-2" id="errorMessage">{{ error }}</p>
                  </template>

                  <form @submit.prevent="resetPassword" v-if="showNewPasswordForm">

                      <input :type="showPassword ? 'text' : 'password'" class="form-control mb-3 shadow-none" placeholder="Create New Password"
                            required v-model="resetPasswordData.password">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control mb-3 shadow-none" placeholder="Confirm Password"
                           required v-model="resetPasswordData.password_confirmation">
                    <input type="tel" class="form-control shadow-none" maxlength="8" placeholder="code (check phone sms)"
                           @input="validateNumber" required v-model.number="resetPasswordData.passwordResetCode">

                    <div class="form-check mt-3">
                      <input class="form-check-input" id="showPassword" type="checkbox" v-model="showPassword">
                      <label class="form-check-label" for="showPassword">
                        Show Password
                      </label>
                    </div>

                    <p style="line-height: 0.7em" class="mt-1">
                      <small class="text-muted" style="font-size: 0.8em;">
                        Password must be at least 6 characters long and contains at least one uppercase letter,
                        one lowercase letter, and one digit.
                      </small>
                    </p>

                    <div class="text-center">
                      <Button label="Submit" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                              class="p-button  p-button-rounded mt-2"/>
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

  <div class="d-none d-sm-block" style="margin-top: 200px;"></div>
</template>


<style scoped>

</style>