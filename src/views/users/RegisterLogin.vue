<script setup>
import {onMounted, reactive, ref} from "vue";
import Button from 'primevue/button';
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import RadioButton from 'primevue/radiobutton';
import {onBeforeRouteLeave, useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";

const closeModal = ref();
const openModal = ref();
const store = useHomeStore();
const router = useRouter();
const showPassword = ref(false);
const registerError = ref('');
const loginError = ref('');
const loadingInProgress = ref(false);

const registerData = reactive({ //Registration Form Data
  phoneNumber: '', password: "", password_confirmation: ''
})
const loginData = reactive({    // Login Form Data
  phoneNumber: null, password: ""
})

const selectedNetwork = ref(null);


//on mounted hook show modal
onMounted(() => {
if (store.token) return router.push({name: 'home'});
  openModal.value.click();
})

//Close modal before leaving this page
onBeforeRouteLeave( (to, from, next) => {
  closeModal.value.click();
  next();
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
    loginError.value = "";
    //Validation
    if (!loginData.phoneNumber) return loginError.value = "Please enter phone number";
    if (loginData.phoneNumber.toString().length  !== 9) return loginError.value = "Please check phone number";
    if (!loginData.password.trim()) return loginError.value = "Please provide a password";
    //Send Data To Server
    const response = await  axios.post(
        '/users/auth/login',
        JSON.stringify(loginData),
    )

    if (response.status === 200) {
      store.setToken(response.data.token);
      store.setUser(response.data.user);
      toast.add({severity:'success', summary: 'Thanks', detail: 'You are logged in', life: 4000});
      return router.push({name: 'home'});
    }



  } catch (e) {
    if (e.response) return loginError.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return loginError.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }

    return loginError.value = 'Sorry, something went wrong. Please try again later';

  } finally { loadingInProgress.value = false; }

}


                  //..............Request SMS code for verification..................
const requestSMS = async () => {

  try {
    loadingInProgress.value = true;
    registerError.value = "";

    const regex = /^(?=.{6,})(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])/

    //Validation
    if (registerData.phoneNumber.toString().length  !== 9) return registerError.value = "Please check phone number";
    if (!registerData.password.trim()) return registerError.value = "Please provide a password";
    if (!registerData.password.match(regex)) return registerError.value = "Minimum password length should be 6 and contains at least 1 special character";
    if (registerData.password !== registerData.password_confirmation) return registerError.value = "Passwords do not match";
    if (!selectedNetwork.value) return registerError.value = "Please select a service provider";

    //Send Data To Server
    const response = await  axios.post(
        '/users/auth/verify',
        JSON.stringify({phoneNumber: registerData.phoneNumber, network: selectedNetwork.value}),
        // {
        //   headers: { 'Authorization': `Bearer ${store.token}`}
        // }
    )

    if (response.status === 200) {
      store.setRegistrationData(registerData.phoneNumber, registerData.password, selectedNetwork.value, response.data.message);
      return router.push({name: 'verify'});
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

<!--  this button launches the modal -->
  <button type="button" ref="openModal" class="d-none mt-5 mb-5" data-bs-toggle="modal" data-bs-target="#authModal"></button>

  <!-- Modal -->
  <div class="modal" id="authModal" tabindex="-1" data-bs-keyboard="false" aria-labelledby="authModal" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body">
          <div class="container-fluid mt-3">
            <div class="row justify-content-center">
              <div class="col-md-6 col-lg-5 col-xl-4">

                <button style="float: right; margin-left: 10px; width: 30px;"
                        class="text-white bg-danger border-0 fw-bold float-end"
                        @click="router.push({name: 'home'})" title="Close">X</button>&nbsp;
                <span class="float-end"><mark>Click here to close </mark></span>

                <br><br>

                <div class="card shadow">
                <TabView>

                  <!--   Login -->
                  <TabPanel header="Login">
                    <form @submit.prevent="login">
                      <template v-if="loginError">
                        <p class="text-danger text-center" id="errorMessage">{{ loginError }}</p>
                      </template>
                      Please Enter Phone Number
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <div class="input-group-text">+233</div>
                        </div>
                        <input type="tel" class="form-control shadow-none" maxlength="10" v-model.number="loginData.phoneNumber"
                               @input="validatePhoneNumber">
                      </div>

                      <br>
                      <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none"
                             v-model="loginData.password" placeholder="Password" maxlength="200">

                      <div class="form-check mt-3">
                        <input class="form-check-input" id="showPassword" type="checkbox" v-model="showPassword">
                        <label class="form-check-label" for="showPassword">
                          Show Password
                        </label>
                      </div>

                      <div class="text-center">
                        <Button label="Login" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                                class="p-button  p-button-rounded mt-2"/>

                      </div>

                    </form>
                    <br>
                    <h6>Forgot your password? click <router-link :to="{name: 'forgot-password'}">here</router-link></h6>
                  </TabPanel>

                  <!--  Register  -->
                  <TabPanel header="Register">

                    <form @submit.prevent="requestSMS">
                      <template v-if="registerError">
                        <p class="text-danger text-center" id="errorMessage">{{ registerError }}</p>
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

                      <div class="">
                        <table class="w-100">
                          <tr>
                            <th>
                              <label for="">
                                <img src="/img/icons/mtn.webp" alt="mtn_logo">
                                <RadioButton name="network" value="mtn" v-model="selectedNetwork" required/>
                              </label>
                            </th>
                            <th>
                              <label for="">
                                <img src="/img/icons/vodafone.webp" alt="vodafone_logo">
                                <RadioButton name="network" value="vodafone" v-model="selectedNetwork" required/>
                              </label>
                            </th>
                            <th>
                              <label for="">
                                <img src="/img/icons/airteltigo.webp" alt="airteltigo_logo">
                                <RadioButton name="network" value="airtelTigo" v-model="selectedNetwork" required/>
                              </label>
                            </th>
                          </tr>

                          <tr class="">
                            <td>Mtn</td>
                            <td>Vodafone</td>
                            <td>AirtelTigo</td>
                          </tr>
                        </table>


                      </div>

                      <br>
                      <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none"
                             v-model="registerData.password" placeholder="Password" maxlength="100">
                      <br>
                      <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none"
                             v-model="registerData.password_confirmation" placeholder="Confirm Password" maxlength="100">

                      <div class="form-check mt-3">
                        <input class="form-check-input" id="showRegisterPassword" type="checkbox" v-model="showPassword">
                        <label class="form-check-label" for="showRegisterPassword">
                          Show Password
                        </label>
                      </div>

                      <div class="text-center">
                        <Button label="Register" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                                class="p-button  p-button-rounded mt-2"/>
                      </div>

                    </form>
                  </TabPanel>

                </TabView>
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

img {
  width: 37px;
  margin-right: .5em;
}


.modal-body {
  width: 100%;
  height: 100vh;
  animation: gradient 2s infinite alternate linear;
  background: hsl(283, 10%, 86%);
}


@keyframes gradient {

  100% {
    background: hsl(336, 2%, 45%);
  }

}



</style>