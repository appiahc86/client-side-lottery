<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import axios from "../axios.js";
import { stakeFunction, formatNumber } from "../functions/index.js";

const toast = useToast();
const today = new Date().getDay();
const payable = ref(0);
//Stake Form Data
let stakeFormData = reactive({
  amountToStake: null, selectedNumbers: []
})

const stakeInProgress = ref(false); //Sets loading status when staking lottery

//carousel images
const ads = ref([
  {img: "/img/carousel/1.jpg"},
  {img: "/img/carousel/2.jpg"},
])

//On mounted Hook
onMounted(() => {
  const numbers = document.querySelectorAll(".numbers-ball");
  for (const number of numbers) {
    number.onclick = function(e){
      if (e.target.classList.contains('active')){
        e.target.classList.remove('active');
        stakeFormData.selectedNumbers = stakeFormData.selectedNumbers.filter(num => num !== parseInt(e.target.innerText));
      }else if (stakeFormData.selectedNumbers.length < 10 && !e.target.classList.contains('active')){
        e.target.classList.add('active');
        return stakeFormData.selectedNumbers.push(parseInt(e.target.innerText))


      }else if (stakeFormData.selectedNumbers.length > 9 && !e.target.classList.contains('active'))
        return  toast.add({severity:'error', summary: 'Error', detail:'You cannot select more than 10 numbers', life: 4000});
    }
  }
})

//Watch amount if it changes, update payable
watch(() => stakeFormData.amountToStake, (value) => {
  if (value < 0) stakeFormData.amountToStake = 0;
  payable.value =  stakeFunction(stakeFormData.selectedNumbers.length, stakeFormData.amountToStake);
})

//Watch selectedNumbers if it changes, update payable
watch(() => stakeFormData.selectedNumbers.length, (value) => {
  payable.value =  stakeFunction(stakeFormData.selectedNumbers.length, stakeFormData.amountToStake);
})

//Stake Lottery
const stakeNow = async () => {
  stakeInProgress.value = true; //Sets loading State
  const numbers = document.querySelectorAll(".numbers-ball");

  try {

    // // validation
    if (!stakeFormData.amountToStake || stakeFormData.amountToStake < 1) return alert('Amount should be at least GHS 1');
    if (stakeFormData.selectedNumbers.length < 2) return alert('Please Select at least two numbers');

    //Send Data To Server
    const response = await  axios.post(
        '/lottery/stake',
        JSON.stringify(stakeFormData),
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
    )

    if (response.status === 200) {
      alert(response.data.message);
    }

      //Clear Form Data
      stakeFormData.selectedNumbers = [];
      stakeFormData.amountToStake = null;
      payable.value = 0;

      for (const number of numbers) {
        if (number.classList.contains('active')) {
          number.classList.remove('active');
        }
      }

  }catch (e) {

    if (e.response){
      alert(e.response.data)
    }else console.log('Sorry, something went wrong')

  }finally {
    stakeInProgress.value = false;
  }

}



</script>

<template>

                <!-- ........... Carousel ............... -->
  <div style="margin-top: 48px !important;">
        <Carousel :value="ads" :numVisible="1" :numScroll="1" :circular="true" :showNavigators="false"
                  :autoplayInterval="4000">
          <template #item="slotProps">
            <div class="product-item">
              <div class="product-item-content">
                <div class="mb-3">
                  <img :src="slotProps.data.img" :alt="slotProps.data.img" class="img-fluid w-100"/>
                </div>
              </div>
            </div>
          </template>
        </Carousel>
  </div>
  <br>
  <div class="container">

          <!-- ................ Game Day images .................. -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card m-0">
          <div class="card-header">
            <h5 class="text-center">Game Day</h5>
          </div>
          <div class="card-body">
            <div class="game-images-wrapper">

              <div class="game-image" :class="today === 1 ? 'active-day' : ''">
                <img src="/img/days/monday-special.png" alt="monday-special" class="img-fluid" :class="today !== 1 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="today === 2 ? 'active-day' : ''">
                <img src="/img/days/lucky-tuesday.png" alt="lucky-tuesday" class="img-fluid"  :class="today !== 2 ? 'img-faded' : ''">
              </div>

              <div class="game-image"  :class="today === 3 ? 'active-day' : ''">
                <img src="/img/days/mid-week.png" alt="mid-week" class="img-fluid" :class="today !== 3 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="today === 4 ? 'active-day' : ''">
                <img src="/img/days/fortune-thursday.png" alt="fortune-thursday" class="img-fluid" :class="today !== 4 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="today === 5 ? 'active-day' : ''">
                <img src="/img/days/friday-bonanza.png" alt="friday-bonanza" class="img-fluid" :class="today !== 5 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="today === 6 ? 'active-day' : ''">
                <img src="/img/days/national-weekly-lotto.png" alt="national-weekly-lotto" class="img-fluid" :class="today !== 6 ? 'img-faded' : ''">
              </div>

              <div class="game-image"  :class="today === 0 ? 'active-day' : ''">
                <img src="/img/days/sunday-aseda.png" alt="sunday-aseda" class="img-fluid" :class="today !== 0 ? 'img-faded' : ''">
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <br>


                <!-- ............. Numbers ............... -->
    <div class="row justify-content-center">
      <div class="col p-3" style="background: #ccc;">

          <h6>You Cannot Select More Than 10 Numbers</h6>
          <div class="numbers-ball-container" @click="numberSelection">
            <template v-for="num in 90">
              <div class="numbers-ball">{{ num }}</div>
            </template>
          </div>

      </div>
    </div>



                          <!--  .............. Stake Section ..............  -->
    <form @submit.prevent="stakeNow">
    <div class="row text-center" v-if="stakeFormData.selectedNumbers.length">

<!--      Selected Numbers-->
      <div class="col-sm-6" style="border: 1px solid #ccc">
        <h6 class="mt-3">Selected Numbers</h6>
                <template v-for="num in stakeFormData.selectedNumbers" :key="num">
                  <div class="numbers-ball-selected d-inline-flex">{{ num }}</div>
                </template>
      </div>


<!--   Amount Entry   -->
      <div class="col-sm-6" style="border: 1px solid #ccc" v-if="stakeFormData.selectedNumbers.length > 1">
          <h6 class="mt-3">Enter Amount To Stake(GHS)</h6>

        <input type="number" class="form-control mb-3 shadow-none" min="0" v-model="stakeFormData.amountToStake">
      </div>
      <h4 class="mt-3">Payable:
        <span class="text-danger">{{ formatNumber(payable) }}</span>
      </h4>
      <Button label="Play Game" type="submit" class="p-button-rounded p-button-sm w-50 mx-auto mt-3"
              :loading="stakeInProgress" loadingIcon="spinner-border"
              v-if="stakeFormData.selectedNumbers.length > 1"
      />

    </div>


    </form>
  </div>


  <br><br><br><br>

  <Toast />
</template>

<style scoped>

.numbers-ball-container {
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
}
.numbers-ball, .numbers-ball-selected {
  cursor: pointer;
  background-color: #fff;
  width: 35px;
  height: 35px;
  border-radius: 20px;
  text-align: center;
  align-items: center;
  display: flex;
  margin: 10px 8px 10px 0;
  justify-content: center;
  font-size: 19px;
  font-weight: bold;
  color: #2f3e4a;
  user-select: none;
}
.numbers-ball:hover {
  background: antiquewhite;
}
.numbers-ball.active, .numbers-ball-selected{
  background-color: #e30c07;
  color: #fff;
}

/* Game images*/
.game-images-wrapper {
  text-align: center;
}
.game-image {
  display: inline-block;
  border: 1.5px solid rgba(204, 204, 204, 0.55);
  margin: 2px;
  padding: 5px;
  box-sizing: border-box;
}
.game-image img {
  width: 80px;
  height: 50px;
}
.img-faded {
  --webkit-filter: grayscale(100%);
  filter: grayscale(100%);
  opacity: 0.3;
}
.active-day {
  background: greenyellow;
}
</style>