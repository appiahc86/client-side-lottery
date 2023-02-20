<script setup>
import { io }  from "socket.io-client";
import { ref } from "vue";
import Toast from "primevue/toast";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Avatar from 'primevue/avatar';
import { useHomeStore } from "./store/home.js";
import { useToast } from "primevue/usetoast";
import {formatNumber} from "@/functions";
import {useRouter} from "vue-router";
import axios from "./axios.js";

const router = useRouter();
window.toast = useToast();
const store = useHomeStore();
const accountLoading = ref(false);

//let visibleLeft = ref(false); // this will toggle the sidebar
let profileSidebar = ref(false); // this will toggle the sidebar for user profile

const socket = io(`${axios.defaults.baseURL}`);

// reload account balance
const reloadAccountBalance = async () => {
  accountLoading.value = true;
  try {
    const response = await  axios.get('/users/transactions/balance',
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
         }
    )

    if (response.status === 200) {
      return store.user.balance = response.data.balance;
      // return toast.add({severity:'success', summary: '', detail: 'Account balance reloaded', life: 3500});
    }
  }catch (e) {
    if (e.response.status === 401) return profileSidebar.value = false;
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: `${e.response.data}`, life: 4000});
    if (e.request && e.request.status === 0) {
      return toast.add({severity:'error', summary: 'Error',
        detail: `Sorry, Connection to Server refused. Please check your internet connection or try again later`,
        life: 4000});
    }
    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later',
      life: 4000});
  }finally { accountLoading.value = false; }
}



//Logout
const logout = () => {
  profileSidebar.value = false;
  store.clearToken();
  store.clearUser();
  router.push({name: 'home'});
}
</script>

<template>

  <nav class="navbar navbar-expand-lg bg-light fixed-top shadow shadow-sm" style="height: 48px;">
    <div class="container-fluid">
      <div class="navbar-brand mb-0">
<!--        <span class="h1 pi pi-list" @click="visibleLeft = true" style="cursor: pointer;">-->
<!--        </span>&nbsp;&nbsp;&nbsp;&nbsp;-->
        <span @click="router.push({name: 'home'})" style="cursor: pointer;">
          <img src="/logo.png" alt="logo" class="logo"></span>
      </div>

      <div class="dropdown">

        <router-link :to="{name: 'register-login'}" v-if="!store.token"
                     class="btn btn-primary btn-sm text-decoration-none register-btn">
          Login <span class="hide-on-sm">/ Register</span>
        </router-link>

        <template v-if="store.token">
          <span class="text-center" style="font-size: .8em;">GHS {{ formatNumber(store.user.balance || 0 ) }} &nbsp;
          <span class="pi pi-sync" style="cursor: pointer;" title="Refresh" @click="reloadAccountBalance" v-if="!accountLoading"></span>
          <span class="spinner-border spinner-border-sm" v-if="accountLoading"></span>
        </span> &nbsp;
          <Avatar icon="pi pi-user" class="mr-2" shape="circle" @click="profileSidebar = true;"
                  style="background-color:#2196F3; color: #ffffff; cursor: pointer;"/>
        </template>


      </div>
    </div>
  </nav>




  <router-view></router-view>

<!--  menu sidebar -->
<!--  <Sidebar v-model:visible="visibleLeft" :baseZIndex="10000">-->
<!--    <ul>-->
<!--      <li style="list-style: none">-->
<!--        <router-link :to="{name: 'home'}" @click="visibleLeft = false" class="text-decoration-none">&#128250; &nbsp; HOME</router-link></li>-->
<!--      <br>-->
<!--      <li style="list-style: none">&#128153; &nbsp; NLA</li>-->
<!--      <br>-->
<!--      <li style="list-style: none">&#128273; &nbsp; RULES</li>-->
<!--      <br>-->
<!--      <li style="list-style: none">&#9203; &nbsp; RESULTS</li>-->
<!--      <br>-->
<!--    </ul>-->
<!--  </Sidebar>-->


<!--  User profile sidebar-->
  <Sidebar v-model:visible="profileSidebar" :baseZIndex="10000"  position="right">

    <li class="text-center" style="font-size: .8em;">Balance: GHS {{ formatNumber(store.user.balance || 0 ) }} &nbsp;
      <span class="pi pi-sync" style="cursor: pointer;" title="Refresh" @click="reloadAccountBalance" v-if="!accountLoading"></span>
      <span class="spinner-border spinner-border-sm" v-if="accountLoading"></span>
    </li>
    <br>
    <div class="d-flex  justify-content-center">
      <router-link :to="{name: 'deposit'}" class="text-decoration-none mx-auto">
        <Button label="Deposit" class="p-button-sm p-button-rounded p-button-danger px-5" @click="profileSidebar = false"/>
      </router-link> &nbsp;
      <router-link :to="{name: 'withdrawal'}" class="text-decoration-none mx-auto">
        <Button label="Withdraw" class="p-button-sm p-button-raised p-button-rounded px-5" @click="profileSidebar = false"/>
      </router-link>
    </div>

    <ul>
      <li class="my-4">
        <router-link :to="{name: 'my-tickets'}" @click="profileSidebar = false" class="text-decoration-none fw-bold">
          My Tickets
        </router-link></li>

      <li class="mb-3">
        <router-link :to="{name: 'transactions'}" @click="profileSidebar = false" class="text-decoration-none fw-bold">
          Transactions
        </router-link></li>

      <li class="mt-5 text-center" style="list-style: none;"><a class="text-decoration-none" @click="logout" style="cursor: pointer;">
        <b><span class="pi pi-power-off text-danger"></span> Logout</b></a>
      </li>
    </ul>
  </Sidebar>

  <Toast position="center" style="padding: 0;" class="my-toast"/>

  <br><br><br><br><br><br>
<!--  Footer -->
  <footer class="bg-dark text-white pb-3">

    <div class="container">
      <div class="row justify-content-center text-center">

        <div class="col-sm-4 mt-3">
          <div class="">
            <div class="">
              <router-link :to="{name: 'home'}" class="text-decoration-none text-white">
                NLA</router-link>
            </div>
            <div class="my-3">
              <router-link :to="{name: 'home'}" class="text-decoration-none text-white">
                RULES</router-link>
            </div>
            <div class="">
              <router-link :to="{name: 'home'}" class="text-decoration-none text-white mb-2">
                RESULTS</router-link>
            </div>

          </div>
        </div>

        <div class="col-sm-4 mt-3">
          <div class="">&copy; All Right Reserved 2023, <span class="text-warning">Nanty </span></div>
        </div>

        <div class="col-sm-4 mt-3">
          <div class="d-flex text-center">
            <div class="mx-auto">
              <a><span class="pi pi-facebook" style="font-size: 1.6em"></span></a>
              <a ><span class="pi pi-youtube mx-4" style="font-size: 1.6em"></span></a>
              <a ><span class="pi pi-twitter" style="font-size: 1.6em"></span></a>
            </div>
          </div>
        </div>

      </div>
    </div>

  </footer>
</template>

<style scoped>
.logo {
  width: 5em;
}

.register-btn {
  font-size: 0.9em;
}
.register-btn:hover {
  background: #580270 !important;
}


@media screen and (max-width: 500px){
  .my-toast{
    font-size: 0.5em !important;
  }
}

@media screen and (max-width: 300px){
  .hide-on-sm{
    display: none;
  }
}
</style>
