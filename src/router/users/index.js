import RegisterLogin from "../../views/users/RegisterLogin.vue";
import ForgotPassword from "../../views/users/ForgotPassword.vue";
import VerifyUser from "../../views/users/VerifyUser.vue";
import Tickets from "../../views/users/Tickets.vue";
import Profile from "../../views/users/Profile.vue";
import Deposit from "../../views/transactions/DepositView.vue";
import Withdrawal from "../../views/transactions/WithdrawalView.vue";
import Transactions from "../../views/transactions/TransactionsIndexView.vue";


const userRoutes = [
    //         ............................AUTH............................
    {
        path: '/users/register-login',
        name: 'register-login',
        component: RegisterLogin
    },
    {  //Verify number
        path: '/users/verify',
        name: 'verify',
        component: VerifyUser
    },

    {  //forgot password
        path: '/users/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword
    },

    //...................................     others        ...................................

    { //User stake
        path: '/users/my-tickets',
        name: 'my-tickets',
        component: Tickets,
        meta: { requiresAuth: true }
    },
    { //User Profile
        path: '/users/profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    { //Deposit
        path: '/users/deposit',
        name: 'deposit',
        component: Deposit,
        meta: { requiresAuth: true }
    },
    { //Withdrawal
        path: '/users/withdrawal',
        name: 'withdrawal',
        component: Withdrawal,
        meta: { requiresAuth: true }
    },
    { //Transactions
        path: '/users/transactions',
        name: 'transactions',
        component: Transactions,
        meta: { requiresAuth: true }
    },

]


export default userRoutes;