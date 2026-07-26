import axiosClient from './axiosClient';

export function fetchYears() {
  return axiosClient.get('/years').then(function (res) {
    return res.data.data;
  });
}

export function fetchSemesters(yearId) {
  return axiosClient.get('/years/' + yearId + '/semesters').then(function (res) {
    return res.data.data;
  });
}

export function fetchSubjects(semesterId) {
  return axiosClient.get('/semesters/' + semesterId + '/subjects').then(function (res) {
    return res.data.data;
  });
}

export function fetchSubject(subjectId) {
  return axiosClient.get('/subjects/' + subjectId).then(function (res) {
    return res.data.data;
  });
}
