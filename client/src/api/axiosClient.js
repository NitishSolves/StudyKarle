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
  async function (error) {
    let data = error.response ? error.response.data : null;

    // Requests made with responseType 'blob' or 'arraybuffer' (e.g. the PDF
    // preview) still get their error body delivered as a Blob/ArrayBuffer,
    // even when the server sent a normal JSON error. Without decoding it
    // here, every such failure silently fell back to the generic message
    // below instead of the real "Note not found" / "Unauthorized" reason.
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        data = JSON.parse(await data.text());
      } catch (parseErr) {
        data = null;
      }
    } else if (data instanceof ArrayBuffer) {
      try {
        data = JSON.parse(new TextDecoder('utf-8').decode(data));
      } catch (parseErr) {
        data = null;
      }
    }

    const message = (data && data.message) || 'Something went wrong. Please try again.';
    const details = (data && data.details) || null;
    return Promise.reject({
      status: error.response ? error.response.status : 0,
      message: message,
      details: details
    });
  }
);

export default axiosClient;
export { API_URL };
