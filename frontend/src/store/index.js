// store/index.js
import { createStore } from 'vuex';
import jwtDecode from 'jwt-decode';

function isTokenValid(token) {
    if (!token) return false;

    try {
        const { exp } = jwtDecode(token);
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default createStore({
    state() {
        return {
            token: localStorage.getItem('token') || null,
            userName: localStorage.getItem('userName') || null,
            userId: localStorage.getItem('userId') || null,
            role: localStorage.getItem('role') || null,

        };
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
        setUserId(state, userId) {
            state.userId = userId;
            localStorage.setItem('userId', userId);
        },
        clearAuthData(state) {
            state.token = null;
            state.userName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
        }
    },
    getters: {
        isLoggedIn: (state) => isTokenValid(state.token),
        getUserName: (state) => state.userName,
    }
});