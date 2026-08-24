import axiosClient from "./axiosClient";

export function fetchAdminStats() {
  return axiosClient.get("/admin/stats").then(function (res) {
    return res.data.data;
  });
}

export function fetchAdminNotes(params) {
  return axiosClient
    .get("/admin/notes", { params: params })
    .then(function (res) {
      return { notes: res.data.data, meta: res.data.meta };
    });
}

export function uploadNote(formData, onProgress) {
  return axiosClient
    .post("/admin/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? function (progressEvent) {
            if (!progressEvent.total) return;
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        : undefined,
    })
    .then(function (res) {
      return res.data.data;
    });
}

export function updateAdminNote(id, payload) {
  return axiosClient.patch("/admin/notes/" + id, payload).then(function (res) {
    return res.data.data;
  });
}

export function deleteAdminNote(id) {
  return axiosClient.delete("/admin/notes/" + id).then(function (res) {
    return res.data.data;
  });
}

export function fetchAdminSubjects() {
  return axiosClient.get("/admin/subjects").then(function (res) {
    return res.data.data;
  });
}

// NEW: Fetch units for a subject (admin side)
export function fetchSubjectUnits(subjectId) {
  return axiosClient
    .get("/subjects/" + subjectId + "/units")
    .then(function (res) {
      return res.data.data;
    });
}

export function createAdminSubject(payload) {
  return axiosClient.post("/admin/subjects", payload).then(function (res) {
    return res.data.data;
  });
}

export function updateAdminSubject(id, payload) {
  return axiosClient
    .patch("/admin/subjects/" + id, payload)
    .then(function (res) {
      return res.data.data;
    });
}

export function deleteAdminSubject(id) {
  return axiosClient.delete("/admin/subjects/" + id).then(function (res) {
    return res.data.data;
  });
}

export function fetchAdminUsers(params) {
  return axiosClient
    .get("/admin/users", { params: params })
    .then(function (res) {
      return { users: res.data.data, meta: res.data.meta };
    });
}

export function updateUserRole(id, role) {
  return axiosClient
    .patch("/admin/users/" + id + "/role", { role: role })
    .then(function (res) {
      return res.data.data;
    });
}

export function deleteAdminUser(id) {
  return axiosClient.delete("/admin/users/" + id).then(function (res) {
    return res.data.data;
  });
}

export function fetchAdminActivity(limit) {
  return axiosClient
    .get("/admin/activity", { params: { limit: limit || 30 } })
    .then(function (res) {
      return res.data.data;
    });
}

export function fetchAdminPdfActivity(limit) {
  return axiosClient
    .get("/admin/pdf-activity", { params: { limit: limit || 20 } })
    .then(function (res) {
      return res.data.data;
    });
}

export function clearAdminPdfActivity() {
  return axiosClient.delete("/admin/pdf-activity").then(function (res) {
    return res.data.data;
  });
}

export function fetchAdminViewHistory(limit) {
  return axiosClient
    .get("/admin/view-history", {
      params: {
        limit: limit || 200,
      },
    })
    .then(function (res) {
      return res.data.data;
    });
}

export function fetchDriveSyncStatus() {
  return axiosClient.get("/admin/drive-sync/status").then(function (res) {
    return res.data.data;
  });
}

export function triggerDriveSync() {
  return axiosClient.post("/admin/drive-sync").then(function (res) {
    return res.data.data;
  });
}
