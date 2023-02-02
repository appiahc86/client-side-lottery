<script setup>
import {onMounted, ref} from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {useHomeStore} from "@/store/home";
import axios from "../../axios.js";

const amount = ref();
const loadingInProgress = ref(false);
const store = useHomeStore();
const networks = ref([
  {name: 'Mtn', value: 'mtn', icon: '/img/icons/mtn.webp'},
  {name: 'Vodafone', value: 'vodafone', icon: '/img/icons/vodafone.webp'},
  {name: 'Airtel Tigo', value: 'airtelTigo', icon: '/img/icons/airteltigo.webp'}
])
const selectedNetwork = ref({name: 'Please Select Network', value: '', icon: ''});


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

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/deposit',
        JSON.stringify({amount: amount.value, network: selectedNetwork.value.value, transactionType: 'deposit'}),
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      amount.value = null;
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
  }finally { loadingInProgress.value = false; console.clear() }
}

</script>


<template>
  <div class="container" style="margin-top: 100px;">
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
            <small id="username2-help" class="text-muted">Minimum deposit amount is GHS 1.00</small>
          </div>
          <div class="text-center">
            <Button label="Top Up Now" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                    class="p-button p-button-rounded mt-4"/>
          </div>

        </form>
      </div>
    </div>

  </div>

</template>

<style scoped>
img {
  width: 37px;
  margin-right: .5em;
}
</style>