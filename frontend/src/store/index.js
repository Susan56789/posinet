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
        setRole(state, role) {
            state.role = role;
            localStorage.setItem('role', role);
        },
        clearAuthData(state) {
            state.token = null;
            state.userName = null;
            state.userId = null;
            state.role = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
        }
    },
    getters: {
        isLoggedIn: (state) => isTokenValid(state.token),
        getUserName: (state) => state.userName,
        getRole: (state) => state.role,
    }
});
