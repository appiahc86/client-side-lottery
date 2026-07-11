<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useHomeStore} from "@/store/home";
import axios from '@/axios';
const store = useHomeStore();
import {useRouter} from 'vue-router';
import Button from "primevue/button";

const router = useRouter();


const referenceNumber = ref(null);
const MIN_AMOUNT = 1;

const dialog = ref(null);
const verifyingPayment = ref(false);

// If reference number is set, show dialog
watch(()=> referenceNumber.value, (value) => {
  if (value) dialog.value.showModal()
  else dialog.value.close();
})

//Go to homepage
const goBack = () => {
  router.push({name: "home"});
}

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
        return toast.add({severity:'warn', detail: "Please check transactions for status update", life: 4000});
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
  <div class="page-wrap my-3">
    <div class="shell">

      <div class="deposit-card">

        <button class="go-back-button" @click="goBack" title="Close">
          X
        </button>

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

<!--      <div class="footer-note text-dark">Need help? Reach support anytime, day or night.</div>-->
      <div class="support-row">
        <span class="support-label">Need help?</span>
        <a
            href="https://wa.me/233504002406"
            target="_blank"
            rel="noopener"
            class="support-icon whatsapp"
            title="Chat with us on WhatsApp"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.004 2C6.486 2 2.01 6.476 2.01 11.994c0 2.114.611 4.083 1.664 5.744L2 22l4.395-1.65a9.94 9.94 0 0 0 5.609 1.648h.004c5.518 0 9.993-4.476 9.993-9.994C21.997 6.476 17.522 2 12.004 2zm0 18.19a8.19 8.19 0 0 1-4.184-1.15l-.3-.178-3.117 1.17.83-3.075-.196-.315a8.176 8.176 0 0 1-1.26-4.35c0-4.522 3.68-8.198 8.203-8.198 2.19 0 4.25.854 5.798 2.404a8.144 8.144 0 0 1 2.404 5.798c0 4.522-3.68 8.198-8.198 8.198z"/>
          </svg>
        </a>
<!--        <a-->
<!--            href="tel:+233504002406"-->
<!--            class="support-icon phone"-->
<!--            title="Call support"-->
<!--        >-->
<!--          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">-->
<!--            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>-->
<!--          </svg>-->
<!--        </a>-->
      </div>


    </div>
  </div>

<!--  Dialog  -->
  <dialog ref="dialog" style="max-width: 320px; border: 1px solid #d8d5d5;">
    <div class="p-2 text-center">
      <button class="text-white bg-danger float-end" @click="closeDialog">X</button>
      <div class="text-center">
        You will receive a prompt on your mobile device. Please complete
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
  --gold-soft: #958359;
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

.go-back-button {
  float: right;
  background: red;
  color: white;
  font-weight: bold;
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
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 162, 75, 0.14);
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
  padding: 0 10px;
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
  border: none;
  background: #85774f;
  color: #fff;
  cursor: not-allowed;
  transform: none;
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
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  background: #85774f;
  color: #fff;
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



.support-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4dfd2;
}

.support-label {
  font-size: 13px;
  color: #7c8f87;
  font-weight: 500;
}

.support-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.support-icon.whatsapp {
  background: #25D366;
  color: #fff;
}

.support-icon.phone {
  background: #0b2b26;
  color: #fff;
}

.support-icon:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

</style>