<script setup>
import {ref} from "vue";
import {useHomeStore} from "@/store/home";
import {useRouter} from "vue-router";


const router = useRouter();
const amount = ref();
const loadingInProgress = ref(false);
const loading = ref(false);
const store = useHomeStore();


</script>


<template>
  <div class="container">
    <div class="">
      <h1 class="text-center">
          <span style="cursor: pointer;"
                class="text-danger"
                @click="router.push({name: 'home'})" title="Close">X</span>
      </h1><br>
      <h3>Please follow these steps to make deposit.</h3> <br>


      <ol class="">
        <li class="">Transfer the desired amount to <b>053 968 3509</b>(MTN).</li>
        <li class="">Name on account: DANIEL YEBOAH OFOSU</li>
        <li class="">Use Your login number as reference.</li>
      </ol>

      <p>NB: Should you wish to follow up on your payment, kindly send a message to our Whatsapp:
       <a href="https://api.whatsapp.com/send?phone=233539683509" target="_blank">053 968 3509</a> or Call
        <a href="tel:+233539683509">053 968 3509</a>
      </p>

    </div>

  </div>


</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
</style>