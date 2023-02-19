<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import moment from "moment";
import axios from "../axios.js";
import { stakeFunction, formatNumber, gameDescription } from "@/functions";
import {useHomeStore} from "@/store/home";
import router from "../router/index.js";
import { useHomeNonPersistStore } from "@/store/homeNonPersist";

const nonPersistStore = useHomeNonPersistStore();
const store = useHomeStore();
const payable = ref(0);
const loading = ref(false);

const today = ref(null);
const ads = computed(() => nonPersistStore.getImages);
const drawResults = computed(() => nonPersistStore.getDrawResults);
const gameDay = ref(null);


//Watch date from store. if it changes, update 'today' variable
watch(() => nonPersistStore.date, (value) => {
    today.value = value;
})


watch(() => today.value, (value) => {
  gameDay.value = value;
  if (moment(value).hours() >= 20){
    gameDay.value = moment(value).add(1, 'days')
  }
})


//Stake Form Data
let stakeFormData = reactive({
  amountToStake: null, selectedNumbers: []
})

const stakeInProgress = ref(false); //Sets loading status when staking lottery


//this function will get current game results from server
const getDrawResults = async () => {
  try {
    const response = await axios.get('/game-results');
    if (response.status === 200){
      nonPersistStore.setDrawResults(response.data.gameResults);
      nonPersistStore.setDate(response.data.date);

    }
  }catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

    if (e.request && e.request.status === 0) {
      return toast.add({severity:'error', summary: 'Error', detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later', life: 4000});
    }
    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try reloading', life: 4000});

  }finally { loading.value = false }
}
//Load images from db if pinia store is empty
if (!drawResults.value.length)getDrawResults();

// this function will get carousel images
const getImages = async () => {
try {
  const response = await  axios.get('/images',
      {
        headers: { 'Authorization': `Bearer ${store.token}`}
      }
  )

  if (response.status === 200) {
    nonPersistStore.setImages(response.data.images);
    nonPersistStore.setDate(response.data.date);
  }
}catch (e) {
  console.log(e.message)}
}

//Load images from db if pinia store is empty
getImages();


//On mounted Hook
onMounted(() => {

  setInterval(() => {
    if (today.value){
      today.value = moment(today.value).add(1, 'seconds');
    }
  }, 1000)

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
        return  toast.add({severity:'warn', summary: 'Sorry!', detail:'You cannot select more than 10 numbers', life: 4000});
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

//Validate amount
const validateAmount = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = e.target.value.replace(/(\..*)\./g, '$1');
}

//Stake Lottery
const stakeNow = async () => {
  if (!store.token) return router.push({name: 'register-login'})
  stakeInProgress.value = true; //Sets loading State
  const numbers = document.querySelectorAll(".numbers-ball");

  try {

    // // validation
    if (stakeFormData.selectedNumbers.length < 2) {
      return toast.add({severity:'warn', summary: 'Error', detail: 'Please Select at least two numbers', life: 4000});
    }

    if (!stakeFormData.amountToStake || stakeFormData.amountToStake < 1){
      return toast.add({severity:'warn', summary: 'Error', detail: 'Amount should be at least GHS 1', life: 4000});
    }

    if (parseFloat(store.user.balance) < parseInt(payable.value)){
      return toast.add({severity:'warn', summary: 'Error', detail: 'Balance is not sufficient', life: 4000});
    }

    if (payable.value < 1) return toast.add({severity:'warn', summary: 'Error',
      detail: `Minimum amount should be 1`, life: 4000});



    //Send Data To Server
    const response = await  axios.post(
        '/lottery/stake',
        JSON.stringify(stakeFormData),
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 201) {
      store.user.balance  = parseFloat(store.user.balance) - parseFloat(payable.value);
      toast.add({severity:'success', summary: 'Thank You', detail: 'Your Stake was successful!', life: 4000});
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

    if (e.response) return  toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

    if (e.request && e.request.status === 0) {
      return  toast.add({
        severity:'error', summary: 'Error',
        detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later',
        life: 4000});
    }

    return toast.add({severity:'warn', summary: 'Error',
      detail: 'Sorry, something went wrong. Please try again later', life: 4000})

  }finally {
    stakeInProgress.value = false;
  }

}


</script>

<template>

  <!--    Header  -->
    <div class="context text-center text-white">
      <template v-if="loading">
                      <h4 class="text-white" style="margin-top: 5%;">Loading Game Results.....
                        <span class="spinner-border spinner-border-sm"></span>
                      </h4>
                    </template>

                    <template v-if="drawResults.length">
                                  <h1 class="text-white"><b>{{ gameDescription(nonPersistStore.drawResults[0].drawDate) }}</b></h1>

                                  <div class="d-inline-flex text-center">
                                    <h1 class="star">{{ drawResults[0] }}</h1>
                                    <h1 class="star">{{ drawResults[1] }}</h1>
                                    <h1 class="star">{{ drawResults[2] }}</h1>
                                    <h1 class="star">{{ drawResults[3] }}</h1>
                                    <h1 class="star">{{ drawResults[4] }}</h1>
                                  </div>
                    </template>
                    <template v-else>
                      <h3 class="text-white" style="margin-top: 4%">Welcome to Nanty</h3>
                    </template>
    </div>


    <div class="area" >
      <ul class="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div >


  <!-- ........... Carousel ............... -->
    <Carousel :value="ads" :numVisible="1" :numScroll="1" :circular="true" :showNavigators="false"
              :showIndicators="false" :autoplayInterval="4000">
      <template #item="slotProps">
        <div class="product-item">
          <div class="product-item-content">
            <div class="mb-3">
              <img :src="slotProps.data.name" alt="image" class="img-fluid w-100" style="max-height: 320px;"/>
            </div>
          </div>
        </div>
      </template>
    </Carousel>


  <div class="container mt-2">
          <!-- ................ Game Day images .................. -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card m-0">
          <div class="card-header">
            <h6 class="text-center" v-if="gameDay  && moment(gameDay).hours() >= 19 && moment(gameDay).hours() < 20">
              Status: <span class="text-danger">Closed</span>
            </h6>
            <h6 class="text-center" v-else>
              Status: <span class="text-success">Open</span>
            </h6>
            <span v-if="today">{{ today ? moment(today).format('Do MMM YYYY, h:mm:ss a') : '' }}</span>
            <span v-else class="invisible">.............</span>
          </div>
          <div class="card-body">
            <div class="game-images-wrapper">

              <div class="game-image" :class="gameDay  && moment(gameDay).day() === 1 ? 'active-day' : ''">
                <img src="../../public/img/days/monday-special.png" alt="monday-special" class="img-fluid" :class="gameDay  && moment(gameDay).day() !== 1 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="gameDay && moment(gameDay).day() === 2 ? 'active-day' : ''">
                <img src="../../public/img/days/lucky-tuesday.png" alt="lucky-tuesday" class="img-fluid"  :class="gameDay && moment(gameDay).day() !== 2 ? 'img-faded' : ''">
              </div>

              <div class="game-image"  :class="gameDay && moment(gameDay).day() === 3 ? 'active-day' : ''">
                <img src="../../public/img/days/mid-week.png" alt="mid-week" class="img-fluid" :class="gameDay && moment(gameDay).day() !== 3 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="gameDay && moment(gameDay).day() === 4 ? 'active-day' : ''">
                <img src="../../public/img/days/fortune-thursday.png" alt="fortune-thursday" class="img-fluid" :class="gameDay && moment(gameDay).day() !== 4 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="gameDay && moment(gameDay).day() === 5 ? 'active-day' : ''">
                <img src="../../public/img/days/friday-bonanza.png" alt="friday-bonanza" class="img-fluid" :class="gameDay && moment(gameDay).day() !== 5 ? 'img-faded' : ''">
              </div>

              <div class="game-image" :class="gameDay && moment(gameDay).day() === 6 ? 'active-day' : ''">
                <img src="../../public/img/days/national-weekly-lotto.png" alt="national-weekly-lotto" class="img-fluid" :class="gameDay && moment(gameDay).day() !== 6 ? 'img-faded' : ''">
              </div>

              <div class="game-image"  :class="gameDay && moment(gameDay).day() === 0 ? 'active-day' : ''">
                <img src="../../public/img/days/sunday-aseda.png" alt="sunday-aseda" class="img-fluid" :class="gameDay && moment(gameDay).day() !== 0 ? 'img-faded' : ''">
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <br>


                <!-- ............. Numbers ............... -->
    <div class="row justify-content-center">
      <div class="col p-3" style="background: rgb(84,77,150);">

          <h6 class="text-white">You Cannot Select More Than 10 Numbers</h6>
          <div class="numbers-ball-container">
            <template v-for="num in 90">
              <div class="numbers-ball">{{ num }}</div>
            </template>
          </div>

      </div>
    </div>

                          <!--  .............. Stake Section ..............  -->
    <form @submit.prevent="stakeNow">
    <div class="row text-center">

<!--      Selected Numbers-->
      <div class="col-sm-6" style="border: 1px solid #ccc">
        <h6 class="mt-3">Selected Numbers</h6>
                <template v-for="num in stakeFormData.selectedNumbers" :key="num">
                  <div class="numbers-ball-selected d-inline-flex">{{ num }}</div>
                </template>
      </div>


<!--   Amount Entry   -->
      <div class="col-sm-6" style="border: 1px solid #ccc">
          <h6 class="mt-3">Perm Each</h6>

        <input type="tel" class="form-control mb-3 shadow-none" minlength="1" maxlength="5"
               v-model.number="stakeFormData.amountToStake" @input="validateAmount" placeholder="Amount(GHS)">
      </div>
      <h4 class="mt-3">Payable:
        <span class="text-danger">{{ formatNumber(payable) }}</span>
      </h4>
<!--      <div class="fixed-bottom navbar">-->
        <Button label="Play Game" type="submit" class="p-button-rounded p-button-sm w-50 mx-auto mt-3"
                :loading="stakeInProgress" loadingIcon="spinner-border spinner-border-sm"
                :disabled="stakeFormData.selectedNumbers.length < 2" />
<!--      </div>-->


    </div>


    </form>
  </div>

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





/* Header styles*/

/*.result-numbers{*/
/*  border: 1px solid white;*/
/*  background: transparent;*/
/*  color: white;*/
/*  font-weight: normal;*/
/*  height: 1.8em;*/
/*  width: 1.8em;*/
/*  font-size: 1.5em;*/
/*  border-radius: 50px;*/
/*}*/
.result-numbers:hover{
  background: transparent;
}



.star {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(204, 204, 204, 0.38);
  color: white;
  margin: 0 3px;
  font-weight: normal;
  height: 2em;
  width: 2em;
}

@media screen and (max-width: 300px) {
  .star{
    height: 1.7em;
    width: 1.7em;
  }
}


@media screen and (min-width: 500px) {
.result-numbers{
  height: 2em;
  width: 2em;
  font-size: 2em;
}
}




/*...........................new.................*/

.context {
  width: 100%;
  position: absolute;
  top: 13%;
}

.context h1{
  text-align: center;
  color: #fff;
}


.area{
  background: #4e54c8;
  background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);
  width: 100%;
  height: 40vh;
}

.circles{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: inherit;
  overflow: hidden;
}

.circles li{
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  animation: animate 25s linear infinite;
  bottom: -150px;

}

.circles li:nth-child(1){
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}


.circles li:nth-child(2){
  left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
}

.circles li:nth-child(3){
  left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
}

.circles li:nth-child(4){
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
}

.circles li:nth-child(5){
  left: 65%;
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.circles li:nth-child(6){
  left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
}

.circles li:nth-child(7){
  left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
}

.circles li:nth-child(8){
  left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
}

.circles li:nth-child(9){
  left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
}

.circles li:nth-child(10){
  left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
}



@keyframes animate {

  0%{
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }

  100%{
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }

}
</style>
