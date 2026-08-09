import axiosClient from "./axiosClient";

// Legacy direct signup (kept for backward compatibility)
export function signup(payload) {
  return axiosClient.post("/auth/signup", payload).then(function (res) {
    return res.data.data;
  });
}

// NEW: OTP-based signup flow
export function requestOtp(payload) {
  return axiosClient.post("/auth/request-otp", payload).then(function (res) {
    return res.data.data;
  });
}

export function verifyOtp(payload) {
  return axiosClient.post("/auth/verify-otp", payload).then(function (res) {
    return res.data.data;
  });
}

export function resendOtp(payload) {
  return axiosClient.post("/auth/resend-otp", payload).then(function (res) {
    return res.data.data;
  });
}

export function login(payload) {
  return axiosClient.post("/auth/login", payload).then(function (res) {
    return res.data.data;
  });
}

export function logout() {
  return axiosClient.post("/auth/logout").then(function (res) {
    return res.data.data;
  });
}

export function fetchCurrentUser() {
  return axiosClient.get("/auth/me").then(function (res) {
    return res.data.data;
  });
}
