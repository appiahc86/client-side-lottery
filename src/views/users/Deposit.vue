<script setup>
import {onMounted, ref} from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {useHomeStore} from "@/store/home";
import axios from "../../axios.js";

const amount = ref();
const loadingInProgress = ref(false);
const loading = ref(false);
const store = useHomeStore();
const paymentDialog = ref();
const submitOtpDialog = ref();
const otp = ref('');
const referenceNumber = ref('');

const networks = ref([
  {name: 'Mtn', value: 'mtn', icon: '/img/icons/mtn.webp'},
  {name: 'Vodafone', value: 'vodafone', icon: '/img/icons/vodafone.webp'},
  {name: 'Airtel Tigo', value: 'airtelTigo', icon: '/img/icons/airteltigo.webp'}
])
const selectedNetwork = ref({name: 'Please Select Network', value: '', icon: ''});
const display_text = ref('');

onMounted(() => {
  const network = store.user.network;
  if (network) {
    const nn = networks.value.filter(net => {
      return net.value === network;
    })

    selectedNetwork.value = nn[0];
  }
})

//Validate amount
const validateAmount = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}



//................Submit Deposit request......................
const deposit = async () => {
  try {
    loadingInProgress.value = true;
    //Validation
    if (!selectedNetwork.value.value) return toast.add({severity:'warn', summary: 'Error',
      detail: `Please select Service provider`, life: 4000});

    if (amount.value < 1) return toast.add({severity:'warn', summary: 'Error',
      detail: `Minimum amount should be 1`, life: 4000});

    if (amount.value > 2000) return toast.add({severity:'warn', summary: 'Error',
      detail: `Maximum amount should be 2,000`, life: 4000});

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/deposit',
        JSON.stringify({ amount: amount.value, network: selectedNetwork.value.value }),
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      amount.value = null;
      referenceNumber.value = response.data.reference;
      display_text.value = response.data. display_text
      if (response.data.network === "vodafone"){
        submitOtpDialog.value.showModal();
        submitOtpDialog.value.addEventListener('cancel', (e) => e.preventDefault());
      }else {
        paymentDialog.value.showModal();
        paymentDialog.value.addEventListener('cancel', (e) => e.preventDefault());
      }

      // return toast.add({severity:'success', detail: response.data, life: 4000});
    }

  }catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: `${e.response.data}`, life: 4000});
    if (e.request && e.request.status === 0) {
      return toast.add({severity:'error', summary: 'Error',
        detail: `Sorry, Connection to Server refused. Please check your internet connection or try again later`,
        life: 4000});
    }

    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later',
      life: 4000});
  }finally { loadingInProgress.value = false; }
}



//........................Verify payment.....................
const verifyPayment = async () => {
  try {
    loading.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/verify',
        JSON.stringify({ reference: referenceNumber.value}),
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      if (response.data.balance !== 0){
        store.user.balance = response.data.balance ;
      }
      referenceNumber.value = '';
    }

  }catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: `${e.response.data}`, life: 4000});
    if (e.request && e.request.status === 0) {
      return toast.add({severity:'error', summary: 'Error',
        detail: `Sorry, Connection to Server refused. Please check your internet connection or try again later`,
        life: 4000});
    }

    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later',
      life: 4000});
  }finally { loading.value = false; paymentDialog.value.close(); }
}


//Submit Otp
const submitOtp = async () => {
  try {
    loading.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/submit_otp',
        JSON.stringify({ otp: otp.value, reference: referenceNumber.value}),
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      toast.add({severity:'success', summary: 'Success', detail: "Your request was received and it's processing", life: 4000});
    }

  }catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: `${e.response.data}`, life: 4000});
    if (e.request && e.request.status === 0) {
      return toast.add({severity:'error', summary: 'Error',
        detail: `Sorry, Connection to Server refused. Please check your internet connection or try again later`,
        life: 4000});
    }

    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later',
      life: 4000});
  }finally { loading.value = false; submitOtpDialog.value.close(); otp.value = ''; }
}

</script>


<template>
  <div class="container" style="margin-top: 100px; margin-bottom: 50vh;">
    <h3 class="text-center">Deposit</h3>
    <div class="row justify-content-center">
      <div class="col-sm-6 col-md-5">
        <form  @submit.prevent="deposit">
          <input type="text" class="p-inputtext w-100 p-disabled rounded-pill px-3" :value="store.user.phone" disabled><br><br>
          <Dropdown v-model="selectedNetwork" :options="networks" optionLabel="name" class="w-100 rounded-pill px-2">
            <template #value="slotProps">
              <div class="d-flex">
                <img :src="slotProps.value.icon" />
                <div>{{slotProps.value.name}}</div>
              </div>

            </template>
            <template #option="slotProps">
              <div class="d-flex">
                <img :src="slotProps.option.icon" />
                <div>{{slotProps.option.name}}</div>
              </div>
            </template>
          </Dropdown><br><br>
          <div class="field">
            <input type="tel" v-model.number="amount" minlength="1" maxlength="4" aria-describedby="username2-help"
                   class="p-inputtext w-100 rounded-pill px-3" placeholder="Amount" required @input="validateAmount">

          </div>
          <div class="text-center">
            <Button label="Top Up Now" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                    class="p-button p-button-rounded mt-4"/>
          </div>
          <br>

            <ol class="">
              <li class="text-muted"><small>Maximum deposit amount is GHS 2,000</small></li>
              <li class="text-muted"><small>Minimum deposit amount is GHS 1</small></li>
            </ol>


        </form>
      </div>
    </div>

  </div>



<!--  payment Dialog -->
  <dialog ref="paymentDialog" class="border-0 px-3">
    <button class="text-white bg-danger float-end" @click="paymentDialog.close()"><b>X</b></button>
    <br>
    <p class="text-center">{{ display_text }}</p>
    <p class="text-center"><small>If you click close, you would have to manually
      click on the icon next to your account balance to update it.</small></p>
    <div class="text-center">
      <form @submit.prevent="verifyPayment">
        <Button label="I'm done with the payment" type="submit" :loading="loading" loadingIcon="spinner-border spinner-border-sm"
                class="p-button p-button-rounded mt-3"/>
      </form>
    </div>
  </dialog>


<!-- submit otp dialog -->
  <dialog ref="submitOtpDialog" class="border-0 px-3">
    <button class="text-white bg-danger float-end" @click="submitOtpDialog.close()"><b>X</b></button>
    <br>
    <p class="text-center">{{ display_text }}</p>

    <div class="text-center">
      <form @submit.prevent="submitOtp">
        <div class="text-center">
          <input type="text" class="form-control shadow-none" required minlength="2" maxlength="40"
                 v-model="otp" placeholder="Input the voucher">
        </div>
        <Button label="Submit" type="submit" :loading="loading" loadingIcon="spinner-border spinner-border-sm"
                class="p-button p-button-rounded mt-3"/>
      </form>
    </div>
  </dialog>

</template>

<style scoped>
img {
  width: 37px;
  margin-right: .5em;
}
</style>