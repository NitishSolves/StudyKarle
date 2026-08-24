// Facade over pdf_activity for the three PDF actions StudyKarle tracks:
// open, download, share.
//
// Every record call is guaranteed never to reject: activity tracking is a
// secondary concern and must never break the core PDF preview/download/share
// flows. Callers may fire-and-forget or await; either way a DB failure only
// yields `false` (not recorded), never an exception.

const pdfActivityModel = require("../models/pdfActivityModel");

function safeRecord(promise) {
  return promise.catch(function () {
    return false;
  });
}

module.exports = {
  // One meaningful open per user/PDF inside this window. Handles React
  // re-renders, remounts, and pdf.js Range requests while still letting a
  // genuine re-open after the window record a new event.
  recordOpen(userId, resourceType, pdfId, pdfName) {
    return safeRecord(
      pdfActivityModel.record({
        userId: userId,
        resourceType: resourceType,
        pdfId: pdfId,
        pdfName: pdfName,
        activityType: "pdf_opened",
        dedupWindowMinutes: pdfActivityModel.DEFAULT_OPEN_DEDUP_WINDOW_MINUTES,
      })
    );
  },

  recordDownload(userId, resourceType, pdfId, pdfName) {
    return safeRecord(
      pdfActivityModel.record({
        userId: userId,
        resourceType: resourceType,
        pdfId: pdfId,
        pdfName: pdfName,
        activityType: "pdf_downloaded",
      })
    );
  },

  recordShare(userId, resourceType, pdfId, pdfName) {
    return safeRecord(
      pdfActivityModel.record({
        userId: userId,
        resourceType: resourceType,
        pdfId: pdfId,
        pdfName: pdfName,
        activityType: "pdf_shared",
      })
    );
  },

  recent(limit) {
    return pdfActivityModel.recent(limit);
  },

  clear() {
    return pdfActivityModel.clear();
  },
};
