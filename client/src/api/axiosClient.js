import axios from 'axios';

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      'Something went wrong. Please try again.';
    const details = (error.response && error.response.data && error.response.data.details) || null;
    return Promise.reject({
      status: error.response ? error.response.status : 0,
      message: message,
      details: details
    });
  }
);

export default axiosClient;
export { API_URL };
