import axios from "axios";
const BASE_URL = " https://8582-2409-4089-ab15-8290-8594-f8dc-80b6-148c.ngrok-free.app/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export default axiosInstance;
