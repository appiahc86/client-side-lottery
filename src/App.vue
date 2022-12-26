<script setup>
import { io }  from "socket.io-client";
import { ref } from "vue";
import Toast from "primevue/toast";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Avatar from 'primevue/avatar';
import { useHomeStore } from "./store/home.js";
import { useToast } from "primevue/usetoast";
import {useRouter} from "vue-router";

const router = useRouter();
window.toast = useToast();
const store = useHomeStore();

let visibleLeft = ref(false); // this will toggle the sidebar
let profileSidebar = ref(false); // this will toggle the sidebar for user profile

// const socket = io('http://localhost:3000');

//Logout
const logout = () => {
  store.clearToken();
  router.push({name: 'home'});
  profileSidebar.value = false;
}
</script>

<template>

  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <h4 class="navbar-brand mb-0 h1 pi pi-list" @click="visibleLeft = true"></h4>
      <div class="dropdown">

        <router-link :to="{name: 'register-login'}" v-if="!store.token"
                     class="badge bg-dark rounded-pill text-white text-decoration-none register-btn">
          Login / Register
        </router-link>

        <Avatar icon="pi pi-user" class="mr-2" style="background-color:#2196F3; color: #ffffff"
               v-if="store.token" shape="circle" @click="profileSidebar = true"/>

      </div>
    </div>
  </nav>




  <router-view></router-view>

<!--  menu sidebar -->
  <Sidebar v-model:visible="visibleLeft" :baseZIndex="10000">
    <ul>
      <li><router-link :to="{name: 'home'}" @click="visibleLeft = false">Home</router-link></li>
      <br>
      <li>How To Play</li>
      <br>
      <li>Results</li>
      <br>
      <li><router-link :to="{name: 'about'}" @click="visibleLeft = false">About</router-link></li>
    </ul>
  </Sidebar>


<!--  User profile sidebar-->
  <Sidebar v-model:visible="profileSidebar" :baseZIndex="10000"  position="right">

    <div class="d-flex  justify-content-center">
      <a class="text-decoration-none mx-auto">
        <Button label="Deposit" class="p-button-sm p-button-rounded p-button-danger px-5" />
      </a> &nbsp;
      <a class="text-decoration-none mx-auto">
        <Button label="Withdraw" class="p-button-sm p-button-raised p-button-rounded px-5" />
      </a>
    </div>

    <ul>
      <br>
      <li><router-link :to="{name: 'home'}" @click="profileSidebar = false">Profile</router-link></li>
      <br>
      <li>How To Play</li>
      <br>
      <li>Results</li>
      <br>
      <li><a class="text-decoration-none" @click="logout" style="cursor: pointer;">
        <b><span class="pi pi-power-off text-danger"></span> Logout</b></a>
      </li>
    </ul>
  </Sidebar>

  <Toast position="center" style="padding: 0;" class="my-toast"/>
</template>

<style scoped>
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
</style>
