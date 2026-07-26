import axiosClient from './axiosClient';

export function signup(payload) {
  return axiosClient.post('/auth/signup', payload).then(function (res) {
    return res.data.data;
  });
}

export function login(payload) {
  return axiosClient.post('/auth/login', payload).then(function (res) {
    return res.data.data;
  });
}

export function logout() {
  return axiosClient.post('/auth/logout').then(function (res) {
    return res.data.data;
  });
}

export function fetchCurrentUser() {
  return axiosClient.get('/auth/me').then(function (res) {
    return res.data.data;
  });
}
