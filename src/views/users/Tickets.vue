<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";
import moment from "moment";
import { formatNumber } from "@/functions";

const loading = ref(false);
const store = useHomeStore();
const data = ref([]);

//..............Load tickets ..................
const getData = async () => {
  try {
    loading.value = true;

    const response = await  axios.get(
        '/users/tickets',
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
         }
    )

    if (response.status === 200) {
      data.value = response.data.data;
      data.value.map(item => {
        item.numbers = JSON.parse(item.numbers);
      })
    }


  } catch (e) {
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

    if (e.request && e.request.status === 0) {
      return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later', life: 4000});
    }
    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later', life: 4000});

  } finally { loading.value = false; }

}

getData();





</script>

<template>
<h3 class="pt-5 mt-3 text-center">My Tickets</h3>

  <div class="container-fluid" style="margin-bottom: 50vh">
    <div class="row">
      <div class="col">
        <div class="table-responsive">

              <!--        Data table  -->
          <DataTable :value="data"  dataKey="id" :paginator="true" :loading="loading" :rows="10"
                     class="p-datatable-sm p-datatable-striped p-datatable-hoverable-rows p-datatable-gridlines"
                     paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport
              RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50]" responsiveLayout="scroll"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <template #loading>
              <h6 class="text-white fw-bold">Loading Tickets Please wait. <span class="spinner-border spinner-border-sm"></span></h6>

            </template>
            <Column field="id" header="Ticket ID" class="data-table-font-size"></Column>
            <Column field="ticketDate" header="Date" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ moment(data.ticketDate).format("YYYY-MM-DD") }}
                </td>
              </template>
            </Column>
            <Column field="numbers" header="Numbers" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ data.numbers.toString()  }}
                </td>
              </template>
            </Column>
            <Column field="amount" header="Amount" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ formatNumber(data.payable) }}
                </td>
              </template>
            </Column>
            <Column field="ticketStatus" header="Status" class="data-table-font-size"></Column>
            <Column field="amount" header="Won" class="data-table-font-size">
              <template #body="{data}">
                <td :class="data.amountWon ? 'text-success fw-bold' : ''">
                  {{ formatNumber(data.amountWon) || 0 }}
                </td>
              </template>
            </Column>
          </DataTable>

        </div>

      </div>
    </div>
  </div>


</template>


<style scoped>

</style>