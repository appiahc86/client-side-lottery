<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from "../../axios.js";
import { useHomeStore } from "../../store/home.js";

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
        item.numbers = item.numbers.replace("[", "").replace("]", "");
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
<h1 class="pt-5 mt-3 text-center">My Tickets</h1>

  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <div class="table-responsive">

              <!--        Data table  -->
          <DataTable :value="data"  dataKey="name" :paginator="true" :loading="loading" :rows="10"
                     class="p-datatable-sm p-datatable-striped p-datatable-hoverable-rows p-datatable-gridlines"
                     paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport
              RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50]" responsiveLayout="scroll"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <template #loading>
              Loading customers data. Please wait.
            </template>
            <Column field="ticketId" header="Ticket ID" class="data-table-font-size"></Column>
            <Column field="ticketDate" header="Date" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ new Date(data.ticketDate).toLocaleDateString() }}
                </td>
              </template>
            </Column>
            <Column field="numbers" header="Numbers" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ data.numbers }}
                </td>
              </template>
            </Column>
            <Column field="amount" header="Amount" class="data-table-font-size">
              <template #body="{data}">
                <td>
                  {{ data.amount }}
                </td>
              </template>
            </Column>
            <Column field="ticketStatus" header="Status" class="data-table-font-size"></Column>
          </DataTable>

        </div>
      </div>
    </div>
  </div>

<!-- TODO clear this code-->
  <div style="margin-bottom: 200px"></div>
</template>


<style scoped>

</style>