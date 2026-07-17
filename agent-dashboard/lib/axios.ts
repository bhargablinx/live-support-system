import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
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
