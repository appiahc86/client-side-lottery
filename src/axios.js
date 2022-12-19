
import axios from "axios";

// axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.baseURL = "http://192.168.1.101:3000";
axios.defaults.baseURL = "https://test.christrevivalch.org";
// axios.defaults.headers.common['Authorization'] = "Bearer " +  token;
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.delete['Content-Type'] = 'application/json; charset=utf-8';


// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (e) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (e.request && e.request.status === 0) return alert("Sorry, Connection to Server refused");

    return Promise.reject(e);
});

export default axios;