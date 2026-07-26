import axiosClient, { API_URL } from './axiosClient';

export function fetchNotesBySubject(subjectId, page) {
  return axiosClient
    .get('/subjects/' + subjectId + '/notes', { params: { page: page || 1 } })
    .then(function (res) {
      return { notes: res.data.data, meta: res.data.meta };
    });
}

export function fetchRecentNotes(limit) {
  return axiosClient.get('/notes/recent', { params: { limit: limit || 5 } }).then(function (res) {
    return res.data.data;
  });
}

export function fetchNote(noteId) {
  return axiosClient.get('/notes/' + noteId).then(function (res) {
    return res.data.data;
  });
}

export function getPreviewUrl(noteId) {
  return API_URL + '/notes/' + noteId + '/preview';
}

export function getDownloadUrl(noteId) {
  return API_URL + '/notes/' + noteId + '/download';
}

export function searchNotes(query, page) {
  return axiosClient
    .get('/search', { params: { q: query, page: page || 1 } })
    .then(function (res) {
      return { notes: res.data.data, meta: res.data.meta };
    });
}
