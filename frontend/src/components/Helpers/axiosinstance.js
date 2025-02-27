import axios from 'axios'
const BASE_URL =  
  "http://192.168.29.112:5000/api/v1"
 

const axiosInstance = axios.create()
axiosInstance.defaults.baseURL = BASE_URL
axiosInstance.defaults.withCredentials = true


export default axiosInstance