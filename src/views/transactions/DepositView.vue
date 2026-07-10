<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import {useHomeStore} from "@/store/home";
import axios from '@/axios';
const store = useHomeStore();

const referenceNumber = ref(null);
const MIN_AMOUNT = 1;

const dialog = ref(null);
const verifyingPayment = ref(false);

// If reference number is set, show dialog
watch(()=> referenceNumber.value, (value) => {
  if (value) dialog.value.showModal()
  else dialog.value.close();
})

//Close Dialog
const closeDialog = () => {
  referenceNumber.value = null;
}

const NETWORKS = [
  { name: 'MTN', color: '#FFC100', prefixes: ['024', '025', '053', '054', '055', '059'] },
  { name: 'Telecel', color: '#E4002B', prefixes: ['020', '050'] },
  { name: 'AirtelTigo', color: '#0033A0', prefixes: ['026', '027', '056', '057'] },
]

const presets = [5, 20, 50, 100]

// --- Amount state ---
const amountRaw = ref('');
const amountFocused = ref(false);

const amountValue = computed(() => parseFloat(amountRaw.value))

const amountFeedback = computed(() => {
  if (amountRaw.value === '') return { text: '', class: '' }
  if (isNaN(amountValue.value) || amountValue.value < MIN_AMOUNT) {
    return { text: `Minimum deposit is GH₵ ${MIN_AMOUNT.toFixed(2)}`, class: 'text-bad' }
  }
  return { text: '', class: '' }
})

const amountIsValid = computed(() => !isNaN(amountValue.value) && amountValue.value >= MIN_AMOUNT)

// --- Phone state ---
const phoneDigits = ref('0' + store.user.phone)   // raw digits, local format starting with 0

function formatPhoneDisplay(digits) {
  let out = digits.slice(0, 3)
  if (digits.length > 3) out += ' ' + digits.slice(3, 6)
  if (digits.length > 6) out += ' ' + digits.slice(6, 10)
  return out
}

const phoneDisplay = computed(() => formatPhoneDisplay(phoneDigits.value))



const network = computed(() => {
  const prefix3 = phoneDigits.value.slice(0, 3)
  return NETWORKS.find((n) => n.prefixes.includes(prefix3)) || null
})



const phoneIsValid = computed(() => phoneDigits.value.length === 10 && !!network.value)

// --- Submit ---
const submitting = ref(false)
const canSubmit = computed(() => amountIsValid.value && phoneIsValid.value && !submitting.value)


//Deposit Money
async function handleSubmit() {
  if (!canSubmit.value) return;

  try {
    submitting.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/deposit',
        JSON.stringify({amount: Number(amountValue.value.toFixed(2))}),
        {
          headers: { 'Authorization': `Bearer ${store.token}` }
        }
    )

    if (response.status === 200) {
      amountRaw.value = '';
      amountFocused.value = false;
      referenceNumber.value = response.data.referenceNumber;
    }


  } // ./try


 catch (e) {
   if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

   if (e.request && e.request.status === 0) {
     return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later', life: 4000});
   }
   return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later', life: 4000});


 } finally { submitting.value = false}

}

//  Verify Payment
const verifyPayment = async () => {
  try {
    verifyingPayment.value = true;

    //Send Data To Server
    const response = await  axios.post(
        '/users/transactions/verify',
        JSON.stringify({referenceNumber: referenceNumber.value}),
        {
          headers: { 'Authorization': `Bearer ${store.token}` }
        }
    )

    if (response.status === 200) {
      closeDialog();
      store.user.balance = parseFloat(response.data.balance);
      if (response.data.status === "success") {
        return toast.add({severity:'success', summary: 'Success', detail: "Deposit was successful", life: 4000});
      }else {
        return toast.add({severity:'warn', detail: "Please check transaction for status update", life: 4000});
      }
    }


  }catch (e) {
    closeDialog();
    if (e.response) return toast.add({severity:'warn', summary: 'Error', detail: e.response.data, life: 4000});

    if (e.request && e.request.status === 0) {
      return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, Connection to Server refused. Please check your internet connection or try again later', life: 4000});
    }
    return toast.add({severity:'warn', summary: 'Error', detail: 'Sorry, something went wrong. Please try again later', life: 4000});

  }finally {
    verifyingPayment.value = false;
  }
}



// reload account balance
const reloadAccountBalance = async () => {

  try {
    const response = await  axios.get('/users/transactions/balance',
        {
          headers: { 'Authorization': `Bearer ${store.token}`}
        }
    )

    if (response.status === 200) {
      return store.user.balance = response.data.balance;
    }
  }catch (e) { console.clear(); }

}

onMounted( () => {
  reloadAccountBalance();
})

</script>


<template>
  <div class="page-wrap">
    <div class="shell">

      <div class="deposit-card">
        <div class="card-eyebrow">Fund Your Account</div>
        <div class="card-title">Make a deposit</div>
        <div class="card-sub">
          Enter an amount and the mobile money number to charge. Funds reflect in your balance within moments.
        </div>

        <form @submit.prevent="handleSubmit" novalidate>

          <!-- Amount -->
          <div class="field-block">
            <div class="field-label">
              <span>Amount</span>
              <span class="field-hint">Min GH₵ {{ MIN_AMOUNT }}</span>
            </div>

            <div class="amount-shell" :class="{ focused: amountFocused }">
              <div class="currency-seal">GH₵</div>
              <input
                  type="number"
                  class="amount-input"
                  v-model="amountRaw"
                  @focus="amountFocused = true"
                  @blur="amountFocused = false"
                  placeholder="0.00"
                  min="5"
                  step="0.01"
                  inputmode="decimal"
                  autocomplete="off"
              />
            </div>

            <div class="quick-amounts">
              <button
                  v-for="preset in presets"
                  :key="preset"
                  type="button"
                  class="chip-btn"
                  :class="{ active: Number(amountRaw) === preset }"
                  @click="amountRaw = String(preset)"
              >
                GH₵ {{ preset }}
              </button>
            </div>

            <div class="form-feedback-row" :class="amountFeedback.class">
              {{ amountFeedback.text }}
            </div>
          </div>

          <!-- Phone -->
          <div class="field-block" style="margin-bottom: 8px;">
            <div class="field-label">
              <span>Mobile Money Number</span>
            </div>

            <div class="phone-shell">
              <div class="country-tag">
                <span class="flag-dot"></span>
                <span>+233</span>
              </div>
              <input
                  type="tel"
                  class="phone-input"
                  :value="phoneDisplay"
                  placeholder="24 123 4567"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  maxlength="12"
                  disabled
              />
              <div class="network-indicator" :class="{ detected: !!network }">
                <span class="network-dot" :style="{ background: network ? network.color : '#D9D3C2' }"></span>
                <span :style="{ color: network ? '#142420' : '#7C8F87' }">
                  {{ network ? network.name : 'Network' }}
                </span>
              </div>
            </div>


          </div>

          <button type="submit" class="submit-btn" :disabled="!canSubmit || submitting">
            {{ submitting ? 'Processing…' : 'Continue to Pay' }}
          </button>

          <div class="secure-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C8F87" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Encrypted &amp; processed securely</span>
          </div>
        </form>
      </div>

      <div class="footer-note text-dark">Need help? Reach support anytime, day or night.</div>
    </div>
  </div>

<!--  Dialog  -->
  <dialog ref="dialog" style="max-width: 320px; border: 1px solid #d8d5d5;">
    <div class="p-2 text-center">
      <button class="text-white bg-danger float-end" @click="closeDialog">X</button>
      <div class="text-center">
        You will recieve a prompt on your mobile device. Please complete
        the transaction to continue.
      </div>
      <div class="clearfix pt-2"></div>
      <div class="spinner spinner-border text-success"
           role="status" style="font-family: sans-serif;"
           v-if="!verifyingPayment"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="clearfix pb-2"></div>
      <button class="btn btn-secondary" style="font-size: 0.8em;" @click="verifyPayment" :disabled="verifyingPayment">
        <span v-if="verifyingPayment">Please Wait ... <span class="spinner spinner-border spinner-border-sm"></span></span>
        <span v-else>I've completed the verification</span>
      </button>
    </div>
  </dialog>

</template>


<style scoped>

:root {
  --ink: #142420;
  --forest: #0b2b26;
  --forest-deep: #081c18;
  --gold: #c9a24b;
  --gold-soft: #e2c988;
  --cream: #faf8f3;
  --sage: #7c8f87;
  --line: #e4dfd2;
  --danger: #b3473c;
  --ok: #3f7a5c;
}

.page-wrap {
  background: radial-gradient(circle at 20% 0%, #103832 0%, var(--forest) 38%, var(--forest-deep) 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: var(--ink);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  overflow-x: hidden;
}

.page-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.035) 0px,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 38px
  );
  pointer-events: none;
}

.shell {
  position: relative;
  width: 100%;
  max-width: 460px;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  border: 1.5px solid var(--gold-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  color: var(--gold-soft);
  font-size: 15px;
}
.brand-name {
  color: #efe9da;
  letter-spacing: 0.18em;
  font-size: 12.5px;
  text-transform: uppercase;
  font-weight: 600;
}

.deposit-card {
  background: var(--cream);
  border-radius: 18px;
  padding: 44px 40px 36px;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(201, 162, 75, 0.18);
}

.card-eyebrow {
  font-size: 11.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sage);
  font-weight: 600;
  margin-bottom: 6px;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  font-size: 30px;
  color: var(--forest);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.card-sub {
  font-size: 14px;
  color: var(--sage);
  margin-bottom: 32px;
  line-height: 1.5;
}

.field-block {
  margin-bottom: 26px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--forest);
  margin-bottom: 9px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.field-hint {
  font-size: 11px;
  font-weight: 500;
  color: var(--sage);
  text-transform: none;
  letter-spacing: 0;
}

/* Amount field */
.amount-shell {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.amount-shell.focused {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 162, 75, 0.14);
}
.currency-seal {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: var(--forest);
  color: var(--gold-soft);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 14.5px;
}
.amount-input {
  flex: 1 1 auto;
  border: none;
  outline: none;
  padding: 16px 18px 16px 14px;
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 600;
  color: var(--forest);
  background: transparent;
  width: 100%;
  min-width: 0;
}
.amount-input::placeholder {
  color: #c7bfa8;
  font-weight: 500;
}
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.amount-input[type='number'] {
  -moz-appearance: textfield;
}

.quick-amounts {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.chip-btn {
  flex: 1;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--forest);
  font-size: 12.5px;
  font-weight: 600;
  padding: 7px 0;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
}
.chip-btn:hover {
  border-color: var(--gold);
  background: #fbf6e9;
}
.chip-btn.active {
  background: var(--forest);
  border-color: var(--forest);
  color: var(--gold-soft);
}

/* Phone field */
.phone-shell {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.phone-shell.focused {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 162, 75, 0.14);
}
.phone-shell.is-invalid {
  border-color: var(--danger);
}
.country-tag {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  background: #f2efe6;
  border-right: 1px solid var(--line);
  color: var(--ink);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 14px;
}
.flag-dot {
  width: 18px;
  height: 13px;
  border-radius: 2px;
  background: linear-gradient(to bottom, #ce1126 0% 33%, #fcd116 33% 66%, #006b3f 66% 100%);
  flex: 0 0 auto;
}
.phone-input {
  flex: 1 1 auto;
  border: none;
  outline: none;
  padding: 14px 16px 14px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16.5px;
  font-weight: 500;
  color: var(--ink);
  background: transparent;
  width: 100%;
  min-width: 0;
  letter-spacing: 0.02em;
}
.phone-input::placeholder {
  color: #c2bca9;
  font-weight: 500;
}

.network-indicator {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border-left: 1px solid transparent;
}
.network-indicator.detected {
  border-left-color: var(--line);
}
.network-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
  flex: 0 0 auto;
}

.form-feedback-row {
  min-height: 18px;
  font-size: 12px;
  margin-top: 7px;
  font-weight: 500;
}
.form-feedback-row.text-ok {
  color: var(--ok);
}
.form-feedback-row.text-bad {
  color: var(--danger);
}

.submit-btn {
  width: 100%;
  background: var(--forest);
  color: var(--gold-soft);
  border: none;
  padding: 16px 0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 8px;
  transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 24px -10px rgba(11, 43, 38, 0.55);
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  background: grey;
  color: #fff;
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  background: #cfc8b4;
  color: #fff;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.secure-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 20px;
  font-size: 11.5px;
  color: var(--sage);
  letter-spacing: 0.02em;
}

.footer-note {
  text-align: center;
  margin-top: 26px;
  font-size: 12px;
  color: rgba(239, 233, 218, 0.55);
}

@media (max-width: 420px) {
  .deposit-card {
    padding: 34px 24px 28px;
  }
  .card-title {
    font-size: 25px;
  }
  .amount-input {
    font-size: 22px;
  }
}
</style>