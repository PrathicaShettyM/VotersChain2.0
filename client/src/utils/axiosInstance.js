// api connection to the backend
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5018', // Backend URL
  withCredentials: true, // Ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
