<script setup>
import {onMounted, reactive, ref} from "vue";
import Button from 'primevue/button';
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import {useRouter} from "vue-router";
import axios from "../../axios.js";

const router = useRouter();
const showPassword = ref(false);
const dialog = ref();
const registerError = ref('');

const loadingInProgress = ref(false);

const registerData = reactive({ //Registration Form Data
  phoneNumber: '', password: "", password_confirmation: ''
})
const loginData = reactive({    // Login Form Data
  phoneNumber: null, password: ""
})

//Close form
const closeForm = () => {
  dialog.value.close();
  router.push({name: 'home'})
}

//on mounted hook show modal
onMounted(() => {
dialog.value.showModal();
dialog.value.addEventListener('cancel', (e) => e.preventDefault());
})

//Validate phone number
const validatePhoneNumber = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}

                    //..............Login..................
const login = async () => {
  try {
    loadingInProgress.value = true;
    if (phoneNumber.value.toString().length > 9)
      alert('Please check number')
    console.log(phoneNumber.value)
  }catch (e) {

  }finally { loadingInProgress.value = true; }

}


                  //..............Register..................
const registerUser = async () => {

  try {
    loadingInProgress.value = true;

    //Validation
    if (registerData.phoneNumber.toString().length  < 9) return registerError.value = "Please check phone number";
    if (registerData.password.length < 6) return registerError.value = "Password cannot be less than 6 characters";
    if (registerData.password !== registerData.password_confirmation) return registerError.value = "Passwords do not match";

    //clear error message
    registerError.value = "";

    //Send Data To Server
    const response = await  axios.post(
        '/users/register',
        JSON.stringify({...registerData ,password_confirmation: undefined})
    )

    if (response.status === 201) {
      alert('success');
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
<dialog ref="dialog" class="border-0 p-1">

  <button style="float: right; margin-left: 10px; width: 30px;" class="text-white bg-danger border-0 fw-bold"
          @click="closeForm" title="Close">X</button>
  You may click on the close button to exit this page
  <br><br>


  <TabView>
<!--  Register  -->
    <TabPanel header="Register">

      <form @submit.prevent="registerUser">
        <template v-if="registerError">
          <p class="text-danger text-center">{{ registerError }}</p>
        </template>
        Register with your momo number
        <div class="input-group">
          <div class="input-group-prepend">
            <div class="input-group-text">+233</div>
          </div>
          <input type="tel" class="form-control shadow-none" maxlength="10" v-model.number="registerData.phoneNumber"
                 @input="validatePhoneNumber">
        </div>

          <br>
          <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none"
                v-model="registerData.password" placeholder="Password">
          <br>
          <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none"
                v-model="registerData.password_confirmation" placeholder="Confirm Password">

        <div class="form-check mt-3">
          <input class="form-check-input" id="showRegisterPassword" type="checkbox" v-model="showPassword">
          <label class="form-check-label" for="showRegisterPassword">
            Show Password
          </label>
        </div>

        <div class="text-center">
          <Button label="Register" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                  class="p-button  p-button-rounded mt-2"/>
<!--          <button :disabled="loadingInProgress">-->
<!--            Register</button>-->
        </div>

      </form>
    </TabPanel>


<!--   Login -->
    <TabPanel header="Login">
            <form @submit.prevent="login">
              Please Enter Phone Number
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">+233</div>
                </div>
                <input type="tel" class="form-control shadow-none" maxlength="10" v-model.number="loginData.phoneNumber"
                       @input="validatePhoneNumber">
              </div>

              <br>
              <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none" placeholder="Confirm Password">

              <div class="form-check mt-3">
                <input class="form-check-input" id="showPassword" type="checkbox" v-model="showPassword">
                <label class="form-check-label" for="showPassword">
                  Show Password
                </label>
              </div>

              <div class="text-center">
                <Button label="Login" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                        class="p-button  p-button-rounded mt-2"/>

              </div>

            </form>
      <br>
      <h6>Forgot your password? click <a href="">here</a></h6>
    </TabPanel>

  </TabView>

</dialog>
</template>


<style scoped>

</style>