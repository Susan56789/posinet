// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex);

function isTokenValid(token) {
    if (!token) return false;

    try {
        const { exp } = jwtDecode(token);
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default new Vuex.Store({
    state: {
        token: localStorage.getItem('token') || null,
        userName: localStorage.getItem('userName') || null,
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
            localStorage.setItem('token', token);
        },
        setUserName(state, userName) {
            state.userName = userName;
            localStorage.setItem('userName', userName);
        },
        clearAuthData(state) {
            state.token = null;
            state.userName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
        }
    },
    getters: {
        isLoggedIn: state => isTokenValid(state.token),
        getUserName: state => state.userName,
    }
});
