import axiosClient, { API_URL } from "./axiosClient";

// Google Drive is the single source of truth. These endpoints browse the
// canonical Drive node tree (drive_nodes) by stable Drive file id, so the
// hierarchy is preserved exactly at any depth.

export function fetchDriveRoot() {
  return axiosClient.get("/drive").then(function (res) {
    return res.data.data;
  });
}

export function fetchDriveFolder(nodeId) {
  return axiosClient
    .get("/drive/nodes/" + encodeURIComponent(nodeId))
    .then(function (res) {
      return res.data.data;
    });
}

export function fetchDriveFile(nodeId) {
  return axiosClient
    .get("/drive/files/" + encodeURIComponent(nodeId))
    .then(function (res) {
      return res.data.data;
    });
}

export function getDrivePreviewUrl(nodeId) {
  return API_URL + "/drive/files/" + encodeURIComponent(nodeId) + "/preview";
}

export function getDriveDownloadUrl(nodeId) {
  return API_URL + "/drive/files/" + encodeURIComponent(nodeId) + "/download";
}

export function checkDriveFileSaved(nodeId) {
  return axiosClient
    .get("/saved/drive/" + encodeURIComponent(nodeId) + "/status")
    .then(function (res) {
      return res.data.data;
    });
}

export function saveDriveFile(nodeId) {
  return axiosClient
    .post("/saved/drive/" + encodeURIComponent(nodeId))
    .then(function (res) {
      return res.data.data;
    });
}

export function unsaveDriveFile(nodeId) {
  return axiosClient
    .delete("/saved/drive/" + encodeURIComponent(nodeId))
    .then(function (res) {
      return res.data.data;
    });
}
