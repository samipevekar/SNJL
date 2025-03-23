import axios from "axios";
const BASE_URL = "https://dfdd-2401-4900-44e1-566a-a037-8660-e80c-c26d.ngrok-free.app/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export default axiosInstance;
