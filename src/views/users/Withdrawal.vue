<script setup>
import {onMounted, ref} from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {useHomeStore} from "@/store/home";
import axios from "../../axios.js";
import {useRouter} from "vue-router";

const router = useRouter();
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


          //................Submit withdrawal request......................
const withdraw = async () => {
  try {

    loadingInProgress.value = true

    //Validation
    if (!selectedNetwork.value.value) return toast.add({severity:'warn', summary: 'Error',
      detail: `Please select Service provider`, life: 4000});

    if (amount.value < 1) return toast.add({severity:'warn', summary: 'Error',
      detail: `Minimum amount should be 1`, life: 4000});
    if (amount.value > 30000) return toast.add({severity:'warn', summary: 'Error',
      detail: `Maximum amount should be 30,000`, life: 4000});

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/withdraw',
        JSON.stringify({amount: amount.value, network: selectedNetwork.value.value}),
        {
          headers: { 'Authorization': `Bearer ${store.token}` }
        }
    )

    if (response.status === 200) {
      amount.value = null;
      store.user.balance = parseFloat(response.data.balance);
      return toast.add({severity:'success', summary: 'Success', detail: `Your request has been received and its processing`, life: 5000});
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

</script>


<template>
  <div class="container" style="margin-top: 100px; margin-bottom: 50vh;">
    <h3 class="text-center">Withdrawal</h3>
    <div class="row justify-content-center">
      <div class="col-sm-6 col-md-5">

        <h3 style="float: right; margin-left: 10px; width: 30px; cursor: pointer;"
            class="text-danger border-0 float-end"
            @click="router.push({name: 'home'})" title="Close">X</h3>&nbsp;
        <br><br>
        <form  @submit.prevent="withdraw">
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
                <img :src="slotProps.option.icon" alt="image"/>
                <div>{{slotProps.option.name}}</div>
              </div>
            </template>
          </Dropdown><br><br>
          <div class="field">
            <input type="number" v-model.number="amount" min="1" step="0.01" max="30000" aria-describedby="username2-help"
                   class="p-inputtext w-100 rounded-pill px-3" placeholder="Amount" required>
          </div>
          <div class="text-center">
            <Button label="Withdraw" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                    class="p-button p-button-rounded mt-3"/>
          </div>
          <br>
          <ol class="">
            <li class="text-muted"><small>Maximum withdrawal amount is GHS 30,000</small></li>
            <li class="text-muted"><small>Minimum withdrawal amount is GHS 1</small></li>
          </ol>

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