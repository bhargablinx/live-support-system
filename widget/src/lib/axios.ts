import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 10000
});

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // We'll implement automatic token refresh here later.
        return Promise.reject(error);
    },
);

export default api;