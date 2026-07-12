<script setup>
import {onMounted, ref, computed} from 'vue';
import Paginator from 'primevue/paginator';
import axios from "../../axios.js";
import { useHomeStore } from "@/store/home";
import moment from "moment";
import { formatNumber, gameDescription } from "@/functions";
import {useRouter} from "vue-router";

const router = useRouter();
const store = useHomeStore();
const loading = ref(false)
const data = ref([]);
const dialog = ref();
const page = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);
const activeTab = ref('upcoming'); // 'upcoming' (STAKES) | 'past' (RESULTS)

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

      store.user.balance = response.data.balance;

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

//Go to homepage
const goBack = () => {
  router.push({name: "home"});
}


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


// Is this individual number a winning/matched number? Used to color the number chip.
const isHit = (num, item) => {
  if (!item.winningNumbers) return false;
  return item.winningNumbers.includes(num);
}

// Pad single digit numbers the way the reference design shows them (e.g. 8 -> "08")
const pad = (num) => num.toString().padStart(2, '0');

// Flatten the date-grouped `data` into a single list of tickets, each tagged with its draw date,
// for easy splitting into STAKES (open) vs RESULTS (closed) tabs without altering how `data` itself
// is fetched/grouped above.
const flatTickets = computed(() => {
  const list = [];
  for (const row of data.value) {
    for (const item of row.data) {
      list.push({ ...item, date: row.date });
    }
  }
  return list;
});

const upcomingTickets = computed(() => flatTickets.value.filter(t => t.ticketStatus === 'open'));
const pastTickets = computed(() => flatTickets.value.filter(t => t.ticketStatus !== 'open'));

const switchTab = (tab) => { activeTab.value = tab; };

</script>

<template>
  <div class="tickets-page">

    <!-- Top App Bar -->
    <header class="top-bar">
      <button class="icon-btn" @click="router.push({name: 'home'})" title="Close">
        <span class="material-icon">close</span>
      </button>
      <span class="top-bar-title">My Tickets</span>
      <span class="top-bar-spacer"></span>
    </header>

    <main class="page-main">

      <button class="go-back-button" @click="goBack" title="Close">
        X
      </button>

      <!-- Page Title -->
      <div class="page-heading">
        <h1>My Tickets</h1>
        <p>Track your entries and results</p>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button
            class="tab-btn"
            :class="activeTab === 'upcoming' ? 'tab-active' : 'tab-inactive'"
            @click="switchTab('upcoming')">
          STAKES
        </button>
        <button
            class="tab-btn"
            :class="activeTab === 'past' ? 'tab-active' : 'tab-inactive'"
            @click="switchTab('past')">
          RESULTS
        </button>
      </div>

      <!-- STAKES (open/upcoming) -->
      <section v-show="activeTab === 'upcoming'" class="ticket-list">

        <template v-if="upcomingTickets.length">
          <div v-for="item in upcomingTickets" :key="item.id" class="ticket-card">

            <div class="ticket-card-body">
              <div class="ticket-card-header">
                <div>
                  <h3 class="ticket-title">{{ gameDescription(item.date) }}</h3>
                  <p class="ticket-subtitle">Draw: {{ moment(item.date).format("MMM Do YY") }}</p>
                </div>
                <span class="badge badge-active">Active</span>
              </div>

              <!-- Numbers -->
              <div class="number-row">
                <div
                    v-for="num in item.numbers"
                    :key="num"
                    class="number-chip"
                    :class="{ 'number-chip-hit': isHit(num, item) }">
                  <span>{{ pad(num) }}</span>
                </div>
              </div>

              <!-- Staking Details -->
              <div class="stake-details ">
                <div class="stake-col">
                  <span class="stake-label">Perm Amount</span>
                  <span class="stake-value">GHS {{ formatNumber(item.amount) }}</span>
                </div>
                <div class="stake-col stake-col-end">
                  <span class="stake-label">Total Paid</span>
                  <span class="stake-value">GHS {{ formatNumber(item.payable) }}</span>
                </div>
              </div>

              <div class="ticket-footer">
                <span class="ticket-id">ID: #{{ item.id }}</span>
                <span class="ticket-status-text">Waiting for draw</span>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="!loading">
          <div class="empty-state">
            <h3>No Active Stakes</h3>
            <p>Your upcoming entries will appear here.</p>
          </div>
        </template>

      </section>

      <!-- RESULTS (closed) -->
      <section v-show="activeTab === 'past'" class="ticket-list">

        <template v-if="pastTickets.length">
          <div
              v-for="item in pastTickets"
              :key="item.id"
              class="ticket-card"
              :class="item.amountWon ? 'ticket-card-won' : 'ticket-card-lost'">

            <div class="ticket-card-body">
              <div class="ticket-card-header">
                <div>
                  <h3 class="ticket-title" :class="{ 'ticket-title-muted': !item.amountWon }">
                    {{ gameDescription(item.date) }}
                  </h3>
                  <p class="ticket-subtitle">Draw: {{ moment(item.date).format("MMM Do YY") }}</p>
                </div>
                <span class="badge" :class="item.amountWon ? 'badge-won' : 'badge-lost'">
                  {{ item.amountWon ? `Won: GHS ${formatNumber(item.amountWon)}` : 'No Win' }}
                </span>
              </div>

              <div class="number-row" :class="{ 'number-row-muted': !item.amountWon }">
                <div
                    v-for="num in item.numbers"
                    :key="num"
                    class="number-chip"
                    :class="item.amountWon && isHit(num, item) ? 'number-chip-won' : ''">
                  <span>{{ pad(num) }}</span>
                </div>
              </div>

              <!-- Staking Details -->
              <div class="stake-details">
                <div class="stake-col">
                  <span class="stake-label">Perm Amount</span>
                  <span class="stake-value">GHS {{ formatNumber(item.amount) }}</span>
                </div>
                <div class="stake-col stake-col-end">
                  <span class="stake-label">Total Paid</span>
                  <span class="stake-value">GHS {{ formatNumber(item.payable) }}</span>
                </div>
              </div>

              <div class="ticket-footer">
                <span class="ticket-id">ID: #{{ item.id }}</span>
                <span class="ticket-status-text">{{ item.amountWon ? 'Winner' : 'Not a winner' }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="!loading">
          <div class="empty-state">
            <h3>No Results Yet</h3>
            <p>Your completed draws will appear here.</p>
          </div>
        </template>

      </section>

      <!-- Overall empty state (no tickets at all) -->
      <template v-if="!loading && !data.length">
        <div class="empty-state empty-state-main">
          <h3>No Tickets Available</h3>
        </div>
      </template>

    </main>

    <!-- Pagination -->
    <template v-if="totalRecords > 9">
      <Paginator :rows="10" :totalRecords="totalRecords" @page="onPage($event)"></Paginator>
    </template>

    <div v-if="data.length > 0 && data.length < 5" style="margin-bottom: 43vh;"></div>
    <div v-if="data.length > 4" style="margin-bottom: 20vh;"></div>

    <!-- Loading Dialog -->
    <dialog ref="dialog" class="loading-dialog">
      <h6>
        Please wait... <span class="spinner-grow spinner-grow-sm"></span>
      </h6>
    </dialog>

  </div>
</template>


<style scoped>

.tickets-page {
  --primary: #006974;
  --on-primary: #ebfcff;
  --on-primary-container: #00555e;
  --on-surface: #003844;
  --on-surface-variant: #2e6676;
  --secondary: #68597b;
  --background: #fcfdfe;
  --alert-red: #E91E63;
  --won-green: #22c55e;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;

  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--background);
  color: var(--on-surface);
  min-height: 100vh;
  padding-bottom: 24px;
}

/* ---------- Top bar ---------- */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 64px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f1f1;
}
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--primary);
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.icon-btn:hover { background-color: #f3f4f6; }
.material-icon {
  font-family: 'Material Symbols Outlined', sans-serif;
  font-size: 22px;
  line-height: 1;
}
.material-icon::before { content: "\2715"; } /* fallback X glyph if font unavailable */
.top-bar-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--primary);
}
.top-bar-spacer { flex: 1; }

/* ---------- Main / page heading ---------- */
.page-main {
  padding: 80px 16px 16px;
  max-width: 620px;
  margin: 0 auto;
}
.page-heading { margin-bottom: 16px; }
.page-heading h1 {
  font-family: 'Hanken Grotesk', 'DM Sans', sans-serif;
  font-weight: 800;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--on-surface);
  margin: 0;
}
.page-heading p {
  color: var(--on-surface-variant);
  margin: 4px 0 0;
  font-size: 14px;
}

/* ---------- Tabs ---------- */
.tab-switcher {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 16px;
}
.tab-btn {
  flex: 1;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  transition: color 0.2s, border-color 0.2s;
  border-bottom: 3px solid transparent;
}
.tab-active {
  border-bottom-color: #9c27b0;
  color: #9c27b0;
}
.tab-inactive {
  color: var(--on-surface-variant);
}
.tab-inactive:hover { color: var(--primary); }

/* ---------- Ticket list / cards ---------- */
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ticket-card {
  background: #fff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  border: 1px solid var(--gray-100);
}
.ticket-card-won {
  border: 2px solid rgba(34, 197, 94, 0.3);
}
.ticket-card-lost {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  opacity: 0.7;
  box-shadow: none;
}
.ticket-card-body { padding: 16px; }

.ticket-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}
.ticket-title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: var(--primary);
  margin: 0;
}
.ticket-title-muted { color: var(--on-surface-variant); }
.ticket-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--on-surface-variant);
  margin: 4px 0 0;
}

.badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.badge-active {
  background: rgba(0, 105, 116, 0.1);
  color: var(--primary);
  border: 1px solid rgba(0, 105, 116, 0.2);
}
.badge-won {
  background: var(--won-green);
  color: #fff;
}
.badge-lost {
  background: var(--gray-200);
  color: var(--on-surface-variant);
}

/* ---------- Number chips ---------- */
.number-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.number-row-muted {
  filter: grayscale(1);
  opacity: 0.6;
}
.number-chip {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  display: flex;
  color: #016a75;
  align-items: center;
  justify-content: center;
  background: #e2f7ff;
  border: 1px solid var(--gray-200);
}
.number-chip span {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--on-surface);
}
.number-chip-hit {
  background: var(--alert-red);
  border: none;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
}
.number-chip-hit span { color: #fff; }
.number-chip-won {
  background: var(--won-green);
  border: none;
}
.number-chip-won span { color: #fff; }

/* ---------- Stake details ---------- */
.stake-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: #e2f7ff;
  border-radius: 10.5rem;
  border: 1px solid var(--gray-100);
}
.stake-col { display: flex; flex-direction: column; }
.stake-col-end { align-items: flex-end; }
.stake-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--on-surface-variant);
}
.stake-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

/* ---------- Footer row ---------- */
.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed var(--gray-200);
}
.ticket-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--on-surface-variant);
}
.ticket-status-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--secondary);
}

/* ---------- Empty states ---------- */
.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--on-surface-variant);
}
.empty-state h3 { margin: 0 0 4px; color: var(--on-surface); }
.empty-state-main { margin-top: 80px; color: #ac3434; }

/* ---------- Loading dialog ---------- */
.loading-dialog {
  border: 0;
  background: rgba(204, 204, 204, 0.66);
}

.go-back-button {
  float: right;
  background: red;
  color: white;
  font-weight: bold;
}
</style>