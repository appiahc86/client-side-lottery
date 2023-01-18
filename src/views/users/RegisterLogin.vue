<script setup>
import {onMounted, reactive, ref} from "vue";
import Button from 'primevue/button';
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import RadioButton from 'primevue/radiobutton';
import {useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore } from "../../store/home.js";

const store = useHomeStore();
const router = useRouter();
const showPassword = ref(false);
const dialog = ref();
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

//Close form
const closeForm = () => {
  dialog.value.close();
  router.push({name: 'home'})
}

//on mounted hook show modal
onMounted(() => {
if (store.token) return router.push({name: 'home'});
dialog.value.showModal();
dialog.value.addEventListener('cancel', (e) => e.preventDefault());
})

//Validate phone number
const validatePhoneNumber = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}

//Tab change
const tabChanged = (event) => {
  console.log(event)
}

                    //..............Login..................
const login = async () => {
  try {
    loadingInProgress.value = true;
    loginError.value = "";
    //Validation
    if (!loginData.phoneNumber) return loginError.value = "Please enter phone number";
    if (loginData.phoneNumber.toString().length  < 9) return loginError.value = "Please check phone number";
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
        JSON.stringify({...registerData, password_confirmation: undefined}),
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
<dialog ref="dialog" id="myDialog" class="border-0 p-1">

  <button style="float: right; margin-left: 10px; width: 30px;" class="text-white bg-danger border-0 fw-bold"
          @click="closeForm" title="Close">X</button>
  You may click on the close button to exit this page
  <br><br>


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
               v-model="loginData.password" placeholder="Password">

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
      <h6>Forgot your password? click <a href="#">here</a></h6>
    </TabPanel>

    <!--  Register  -->
    <TabPanel header="Register" @tab-change="tabChanged($event)">

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
              <td>Vodafon</td>
              <td>Airteltigo</td>
            </tr>
          </table>


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
          <Button label="Register" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                  class="p-button  p-button-rounded mt-2"/>
        </div>

      </form>
    </TabPanel>

  </TabView>

</dialog>
<div style="margin-bottom: 600px;"></div>
</template>


<style scoped>

img {
  width: 37px;
  margin-right: .5em;
}

@media screen and (min-width: 500px) {
  #myDialog {
    width: 500px;
  }
  #errorMessage {
    max-width: 500px;
  }
}
</style>