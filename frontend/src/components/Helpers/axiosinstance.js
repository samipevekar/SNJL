import axios from "axios";
const BASE_URL = "https://34fd-2409-4089-bcc9-283e-ac72-ba67-6c61-fa1d.ngrok-free.app/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export default axiosInstance;
