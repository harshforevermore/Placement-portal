import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => {
     if (response.status >= 400) {
        console.log(`axiosClient Error: status=${response.status}`)
    }
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      if (!window.navigator.onLine) {
        console.log("Device offline.");
      } else {
        console.log("Cannot reach the server. Please try again later.");
      }
    }
    else {
      console.log(`${error?.status} - ${error.response?.data?.message || error.message}`);
    }
    console.error("API error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;