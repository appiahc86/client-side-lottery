<script setup>
import {onMounted, ref} from "vue";
import InputNumber from "primevue/inputnumber";
import {useRouter} from "vue-router";

const router = useRouter();
const dialog = ref();
const phoneNumber = ref();

const closeForm = () => {
  dialog.value.close();
}

onMounted(() => {
dialog.value.showModal();
dialog.value.addEventListener('cancel', (e) => e.preventDefault());
})
</script>

<template>
<dialog ref="dialog" class="border-0">
  <button style="float: right;" class="btn btn-sm btn-danger" @click="closeForm">X</button>
<!--  <div class="card">-->
<!--    <div class="card-body">-->
      <form>
        <InputNumber v-model="value2" prefix="+233 0" ></InputNumber>
      </form>
<!--    </div>-->
<!--  </div>-->
</dialog>
</template>


<style scoped>

</style>