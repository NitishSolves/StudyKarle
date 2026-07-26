import axiosClient from './axiosClient';

export function fetchSavedNotes() {
  return axiosClient.get('/saved').then(function (res) {
    return res.data.data;
  });
}

export function saveNote(noteId) {
  return axiosClient.post('/saved/' + noteId).then(function (res) {
    return res.data.data;
  });
}

export function unsaveNote(noteId) {
  return axiosClient.delete('/saved/' + noteId).then(function (res) {
    return res.data.data;
  });
}
