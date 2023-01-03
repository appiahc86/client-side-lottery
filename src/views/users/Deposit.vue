<script setup>
import { ref } from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {useHomeStore} from "../../store/home.js";

const amount = ref();
const loadingInProgress = ref(false);
const store = useHomeStore();
const networks = ref([
  {name: 'Mtn', value: 'mtn', icon: '/img/icons/mtn.webp'},
  {name: 'Vodafone', value: 'vodafone', icon: '/img/icons/vodafone.webp'},
  {name: 'Airtel Tigo', value: 'airtelTigo', icon: '/img/icons/airteltigo.webp'}
])
const selectedNetwork = ref( {name: 'Mtn', value: 'mtn', icon: '/img/icons/mtn.webp'})


//................Submit withdrawal request......................
const deposit = async () => {
  try {
    loadingInProgress.value = true


  }catch (e) {

  }finally {  setTimeout(()=>{loadingInProgress.value = false}, 4000) }
}

</script>


<template>
  <div class="container" style="margin-top: 100px;">
    <h3 class="text-center">Deposit</h3>
    <div class="row justify-content-center">
      <div class="col-sm-6 col-md-5">
        <form  @submit.prevent="deposit">
          <input type="text" class="p-inputtext w-100 p-disabled" :value="store.user.phone" disabled><br><br>
          <Dropdown v-model="selectedNetwork" :options="networks" optionLabel="name" class="w-100">
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
            <input type="number" v-model.number="amount" min="1" aria-describedby="username2-help"
                   class="p-inputtext w-100" placeholder="Amount">
<!--            <small id="username2-help" class="text-muted">Minimum withdraw amount is GHS 1.00</small>-->
          </div>
          <div class="text-center">
            <Button label="Top Up Now" type="submit" :loading="loadingInProgress" loadingIcon="spinner-border spinner-border-sm"
                    class="p-button p-button-rounded mt-4"/>
          </div>

        </form>
      </div>
    </div>

  </div>


  <h3 style="margin-bottom: 400px" class="text-white">...........</h3>
</template>

<style scoped>
img {
  width: 37px;
  margin-right: .5em;
}
</style>