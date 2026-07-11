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
  {name: 'Telecel', value: 'telecel', icon: '/img/icons/telecel.png'},
  {name: 'Airtel Tigo', value: 'airtelTigo', icon: '/img/icons/airteltigo.webp'}
])
const selectedNetwork = ref({name: 'Please Select Network', value: '', icon: ''});


//Go to homepage
const goBack = () => {
  router.push({name: "home"});
}


//................Submit withdrawal request......................
const withdraw = async () => {
  try {

    loadingInProgress.value = true

    //Validation
    if (!selectedNetwork?.value?.value) return toast.add({severity:'warn', summary: 'Error',
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
      if (store.user) store.user.balance = parseFloat(response.data.balance)
      return toast.add({severity:'success', summary: 'Success',
        detail: `Your request has been received and will be processed soon.`, life: 5000});
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


// reload account balance
const reloadAccountBalance = async () => {

  try {
    const response = await  axios.get('/users/transactions/balance',
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      return store.user.balance = response.data.balance;
    }
  }catch (e) { console.clear(); }

}


onMounted(() => {
  reloadAccountBalance();

  const network = store?.user?.network;
  if (network) {
    const nn = networks.value.filter(net => {
      return net.value === network;
    })

    selectedNetwork.value = nn[0];
  }

// restrict dropdown networks to user's network
  networks.value = networks.value.filter((network) => {
    return network.value === store?.user?.network;
  })

})
</script>


<template>
  <div class="container" style="margin-top: 100px; margin-bottom: 50vh;">


    <div class="row justify-content-center">

      <div class="shell">
        <button class="go-back-button" @click="goBack" title="Close">
          X
        </button>

        <h3 class="text-center">Withdrawal</h3>
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

<!--        Support -->

        <div class="support-row">
          <span class="support-label">Need help?</span>
          <a
          href="https://wa.me/233504002406"
          target="_blank"
          rel="noopener"
          class="support-icon whatsapp"
          title="Chat with us on WhatsApp"
          >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.004 2C6.486 2 2.01 6.476 2.01 11.994c0 2.114.611 4.083 1.664 5.744L2 22l4.395-1.65a9.94 9.94 0 0 0 5.609 1.648h.004c5.518 0 9.993-4.476 9.993-9.994C21.997 6.476 17.522 2 12.004 2zm0 18.19a8.19 8.19 0 0 1-4.184-1.15l-.3-.178-3.117 1.17.83-3.075-.196-.315a8.176 8.176 0 0 1-1.26-4.35c0-4.522 3.68-8.198 8.203-8.198 2.19 0 4.25.854 5.798 2.404a8.144 8.144 0 0 1 2.404 5.798c0 4.522-3.68 8.198-8.198 8.198z"/>
          </svg>
          </a>
<!--          <a-->
<!--          href="tel:+233504002406"-->
<!--          class="support-icon phone"-->
<!--          title="Call support"-->
<!--          >-->
<!--          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">-->
<!--            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>-->
<!--          </svg>-->
<!--          </a>-->
        </div>

    </div>
    </div>

  </div>

</template>

<style scoped>

.shell{
  position: relative;
  width: 100%;
  max-width: 460px;
}

.go-back-button {
  float: right;
  background: red;
  color: white;
  font-weight: bold;
}

img {
  width: 37px;
  margin-right: .5em;
}

.support-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4dfd2;
}

.support-label {
  font-size: 13px;
  color: #7c8f87;
  font-weight: 500;
}

.support-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.support-icon.whatsapp {
  background: #25D366;
  color: #fff;
}

.support-icon.phone {
  background: #0b2b26;
  color: #fff;
}

.support-icon:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}
</style>