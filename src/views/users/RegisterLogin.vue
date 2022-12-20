<script setup>
import {onMounted, ref} from "vue";
import Button from 'primevue/button';
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Checkbox from "primevue/checkbox";
import {useRouter} from "vue-router";

const router = useRouter();
const showPassword = ref(false);
const dialog = ref();
const phoneNumber = ref();
const loadingInProgress = ref(false);

//Close form
const closeForm = () => {
  dialog.value.close();
  router.push({name: 'home'})
}

//on mounted hook
onMounted(() => {
dialog.value.showModal();
dialog.value.addEventListener('cancel', (e) => e.preventDefault());
})

//Validate phone number
const validatePhoneNumber = (e) => {
  e.preventDefault();
  console.log(e.target.value, e)

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
const register = async () => {
  try {
    loadingInProgress.value = true;
    if (phoneNumber.value.toString().length > 9)
      alert('Please check number')
    console.log(phoneNumber.value);
  }catch (e) {

  }finally { loadingInProgress.value = true; }

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

      <form @submit.prevent="register">
        Register with your momo number
        <div class="input-group">
          <div class="input-group-prepend">
            <div class="input-group-text">+233</div>
          </div>
          <input type="number" class="form-control shadow-none" min="0"
                 v-model.number="phoneNumber">
        </div>

          <br>
          <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none" placeholder="Password">
          <br>
          <input :type="showPassword ? 'text' : 'password'" class="form-control shadow-none" placeholder="Confirm Password">

        <div class="form-check mt-3">
          <input class="form-check-input" id="showPassword" type="checkbox" v-model="showPassword">
          <label class="form-check-label" for="showPassword">
            Show Password
          </label>
        </div>

        <div class="text-center">
          <Button label="Register" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                  class="p-button  p-button-rounded mt-2"/>
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
                <input type="number" min="0" class="form-control shadow-none"
                       v-model.number="phoneNumber">
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