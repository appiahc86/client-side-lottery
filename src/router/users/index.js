import RegisterLogin from "../../views/users/RegisterLogin.vue";
import VerifyUser from "../../views/users/VerifyUser.vue";
import Tickets from "../../views/users/Tickets.vue";

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



    //...................................             ...................................

    { //User stake
        path: '/users/my-tickets',
        name: 'my-tickets',
        component: Tickets,
        meta: { requiresAuth: true }
    },

]


export default userRoutes;