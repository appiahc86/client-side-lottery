import RegisterLogin from "../../views/users/RegisterLogin.vue";
import VerifyUser from "../../views/users/VerifyUser.vue";
const userRoutes = [
    {
        path: '/users/register-login',
        name: 'register-login',
        component: RegisterLogin
    },
    {
        path: '/users/verify',
        name: 'verify',
        component: VerifyUser
    },
]


export default userRoutes;