<script setup>
import {onMounted, ref} from 'vue';
import Paginator from 'primevue/paginator';
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";
import moment from "moment";
import { formatNumber } from "@/functions";
import {useRouter} from "vue-router";

const router = useRouter();
const store = useHomeStore();
const loading = ref(false)
const data = ref([]);
const dialog = ref();
const page = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

//..............Load tickets ..................
const getData = async () => {
  try {

    dialog.value.showModal();
    loading.value = true;

    const response = await  axios.get(
        '/users/tickets',
        {
          params: {
            page: page.value,
            pageSize: pageSize.value,
          },
          headers: { 'Authorization': `Bearer ${store.token}`}
         }
    )

    if (response.status === 200) {

      const tickets = response.data.data;
      tickets.map(item => {
        item.numbers = JSON.parse(item.numbers);
        if (item.winningNumbers) item.winningNumbers = JSON.parse(item.winningNumbers);
      })

      totalRecords.value = response.data.totalRecords;

      if (tickets.length) { //if tickets are not empty
        let newArray = []

        for (const ticket of tickets) {
          //check if date is already pushed to newArray
          let isIn = false;
          for (const n of newArray) {
            if (n.date === ticket.ticketDate) isIn = true;
          }
          //if date is not in newArray
          if (!isIn) newArray.push({date: ticket.ticketDate, data: []});
        }


        //Another loop to push data in newArray
        for (const ticket of tickets) {
          for (const n of newArray) {
            if (n.date === ticket.ticketDate) n.data.push(ticket);
          }
      }

        data.value = newArray;
      } //./if tickets.length

    }//./if response status is 200


  } catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

    if (e.request && e.request.status === 0) {
      return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later', life: 4000});
    }
    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later', life: 4000});

  } finally {
    dialog.value.close();
    loading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

onMounted(() => {
  getData();
})



//Get winning Numbers
const getWinningNumbers = (userNumbers, drawNumbers) => {
//if draw is not performed yet
 if (!drawNumbers) return userNumbers.toString().replaceAll(',', '-');

  let match = userNumbers.filter(number => drawNumbers.includes(number));

  if (!match.length) return userNumbers.toString().replaceAll(',', '-');

  let data = [];
  for (const num of userNumbers) {
      if (match.includes(num)) data.push(`<span class="text-success fw-bold">${num}</span>`)
      else data.push(`<span>${num}</span>`)

  }

  return data.toString().replaceAll(',', '-');

}


const onPage = (event) => {
  page.value = event.page + 1;
  getData();
};

</script>

<template>
<h3 class="pt-5 mt-3 text-center">My Tickets
<span style="float: right; margin-left: 10px; width: 30px; cursor: pointer;"
       class="text-danger border-0 float-end"
       @click="router.push({name: 'home'})" title="Close">
  X
</span>
</h3>

  <div class="container">

    <template v-if="data.length">
      <template v-for="row in data" :key="row.date">
        <div class="row">
          <div class="col-2 px-1" style="border-top: 1px solid black;">
            <p class="float-end">{{ moment(row.date).format("MMM Do YY") }}</p>
          </div>

          <div class="col-10" style="padding-left: 0 !important;">
            <div class="table-responsive">

<!--              Loop through tickets for a particular date-->
              <template v-for="item in row.data" :key="item.id">
                <table class="my-table mb-3">
                  <thead>
                  <tr style="background: #ccc;" :class="item.amountWon ? 'bg-success text-white': ''">
                    <th>Numbers</th>
                    <th>Perm Each</th>
                    <th>Paid</th>
                    <th v-if="item.ticketStatus === 'open'">Waiting</th>
                    <th v-else-if="item.ticketStatus === 'closed' && !item.amountWon">Lost</th>
                    <th v-else>Won</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td v-html="getWinningNumbers(item.numbers, item.winningNumbers)"></td>
                    <td>{{ formatNumber(item.amount) }}</td>
                    <td>{{ formatNumber(item.payable) }}</td>
                    <td v-if="item.amountWon">{{ formatNumber(item.amountWon) }}</td>
                    <td v-else-if="item.ticketStatus === 'closed' && !item.amountWon">0.00</td>
                    <td v-else>...</td>
                  </tr>
                  </tbody>
                </table>

              </template>
              <hr>


            </div>
          </div>
        </div>
      </template>

    </template>

<!--    If no tickets  -->
    <template v-if="!loading && !data.length">
      <div style="margin-top: 200px;" class="text-center text-danger">
        <h3>No Tickets Available</h3>
      </div>
    </template>


  </div>

  <template v-if="totalRecords > 9">
    <Paginator :rows="10" :totalRecords="totalRecords" @page="onPage($event)"
            ></Paginator>
  </template>


  <template v-if="data.length > 0 && data.length < 5">
    <div class="" style="margin-bottom: 43vh;"></div>
  </template>
  <template v-if="data.length > 4 ">
    <div class="" style="margin-bottom: 20vh;"></div>
  </template>

<!-- Loading Dialog -->
  <dialog ref="dialog" class="border-0"  style="background: rgba(204,204,204,0.66);">
    <h6>
      Please wait... <span class="spinner-grow spinner-grow-sm"></span>
    </h6>
  </dialog>
</template>


<style scoped>
.my-table {
  width: 100%;
  font-size: 0.8em;
}
.my-table th, .my-table td {
  border: 1px solid black;
}
</style>