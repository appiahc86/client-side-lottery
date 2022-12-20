<script setup>
import { io }  from "socket.io-client";
import { ref } from "vue";
import Sidebar from "primevue/sidebar";
import Avatar from 'primevue/avatar';

const visibleLeft = ref(false);

// const socket = io('http://localhost:3000');




import  "../public/css/bootstrap.min.css"
</script>

<template>


  <nav class="navbar bg-light fixed-top" style="height: 48px !important;">
    <div class="container-fluid">
      <h4 class="navbar-brand mb-0 h1 pi pi-list" @click="visibleLeft = true"></h4>
      <div class="navbar-nav d-inline-block">
<!--        <a class="badge bg-warning rounded-pill mx-2 text-decoration-none text-dark" style="font-size: 1em; cursor: pointer;">Register</a>-->
        <router-link :to="{name: 'register-login'}"
                     class="badge bg-dark rounded-pill text-white text-decoration-none register-btn">
          Login / Register
        </router-link>
<!--        <Avatar icon="pi pi-user" class="mr-2" style="background-color:#2196F3; color: #ffffff" shape="circle" />-->
      </div>
    </div>



  </nav>





  <router-view></router-view>

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
</template>

<style scoped>
.register-btn {
  font-size: 0.9em;
}
.register-btn:hover {
  background: #580270 !important;
}
</style>
