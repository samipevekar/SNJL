import axios from "axios";
const BASE_URL = "http://192.168.43.111:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export default axiosInstance;
