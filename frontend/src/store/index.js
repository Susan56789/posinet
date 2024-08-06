import { createStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token) {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Invalid token format');
        return false;
    }
    try {
        const { exp } = jwtDecode(token);
        return exp * 1000 > Date.now();
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
}

export default createStore({
    state: () => ({
        token: localStorage.getItem('token') || null,
        userName: localStorage.getItem('userName') || null,
        userId: localStorage.getItem('userId') || null,
        role: localStorage.getItem('role') || null,
    }),
    mutations: {
        setToken(state, token) {
            if (token && token.split('.').length === 3) {
                state.token = token;
                localStorage.setItem('token', token);
            } else {
                console.error('Invalid token format');
                state.token = null;
                localStorage.removeItem('token');
            }
        },
        setUserName(state, userName) {
            if (state.userName !== userName) {
                state.userName = userName;
                localStorage.setItem('userName', userName);
            }
        },
        setUserId(state, userId) {
            if (state.userId !== userId) {
                state.userId = userId;
                localStorage.setItem('userId', userId);
            }
        },
        setRole(state, role) {
            if (state.role !== role) {
                state.role = role;
                localStorage.setItem('role', role);
            }
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
        isLoggedIn: (state) => {
            return state.token && isTokenValid(state.token);
        },
        getUserName: (state) => state.userName,
        getRole: (state) => state.role,
    },
    actions: {
        async login({ commit }, { token, userName, userId, role }) {
            await commit('setToken', token);
            await commit('setUserName', userName);
            await commit('setUserId', userId);
            await commit('setRole', role);
        },
        logout({ commit }) {
            commit('clearAuthData');
        }
    }
});
