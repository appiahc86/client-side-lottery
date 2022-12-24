<script setup>
import {onMounted, ref} from "vue";
import Button from 'primevue/button';
import {useRouter} from "vue-router";
import axios from "../../axios.js";
import { useHomeStore} from "../../store/home.js";

const store = useHomeStore();

const router = useRouter();
const dialog = ref();
const verifyError = ref('');
const verificationCode = ref(null);

const loadingInProgress = ref(false);

//TODO on route leave clear verification data from store

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
const validateNumber = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}



//..............Register..................
const verify = async () => {

  try {
    loadingInProgress.value = true;


    //Send Data To Server
    // const response = await  axios.post(
    //     '/users/verify/1',
    //     JSON.stringify({...registerData ,password_confirmation: undefined})
    // )
    //
    // if (response.status === 201) alert('success'); //success




  }catch (e) {
    if (e.response) return registerError.value = e.response.data;
    if (e.request && e.request.status === 0) {
      return verifyError.value = 'Sorry, Connection to Server refused. Please check your internet connection or try again later';
    }
    return verifyError.value = 'Sorry, something went wrong. Please try again later';

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
        <form action="">
          <input type="tel" class="form-control shadow-none" maxlength="10" v-model.number="verificationCode"
                 @input="validateNumber">

          <div class="text-center">
            <Button label="Verify" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border"
                    class="p-button  p-button-rounded mt-2"/>
          </div>
        </form>
      </div>
  </dialog>
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