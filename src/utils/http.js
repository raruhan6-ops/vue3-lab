import axios from 'axios';
import { useToast } from "vue-toastification";

const http = axios.create({
    // Use environment variable if available, otherwise fallback to relative path (handled by proxy)
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        const toast = useToast();
        let message = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with a status code outside of 2xx
            message = error.response.data?.error || error.response.data?.message || `Error ${error.response.status}`;
        } else if (error.request) {
            // The request was made but no response was received
            message = 'Network Error: Only the void responded.';
        } else {
            // Something happened in setting up the request that triggered an Error
            message = error.message;
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export default http;
