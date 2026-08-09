const driveService = require("./driveService");
const noteModel = require("../models/noteModel");
const unitModel = require("../models/unitModel"); // NEW
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError"); // NEW

// Drive uploads are network-bound, so a handful of parallel uploads cuts
// bulk-upload wall time dramatically without hammering the Drive API.
const UPLOAD_CONCURRENCY = 3;

async function uploadOne(file, metadata) {
  const driveResult = await driveService.uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  const note = await noteModel.create({
    subjectId: metadata.subjectId,
    unitId: metadata.unitId, // ← guaranteed valid
    title: cleanTitle(file.originalname),
    description:
      metadata.description || `Uploaded on ${new Date().toLocaleDateString()}`,
    driveFileId: driveResult.driveFileId,
    fileType: "pdf",
    sizeBytes: driveResult.sizeBytes,
    status: "published",
    uploadedBy: metadata.uploadedBy,
  });

  return {
    id: note.id,
    title: note.title,
    driveFileId: note.drive_file_id,
    sizeBytes: note.size_bytes,
  };
}

async function bulkUploadNotes(files, metadata) {
  const results = {
    success: [],
    failed: [],
  };

  // NEW: Pre-validate unit ownership once
  if (!metadata.unitId) {
    throw ApiError.badRequest("Unit ID is required for bulk upload");
  }
  const unit = await unitModel.findById(metadata.unitId);
  if (!unit || unit.subject_id !== Number(metadata.subjectId)) {
    throw ApiError.badRequest(
      "Selected unit does not belong to the selected subject"
    );
  }

  for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
    const batch = files.slice(i, i + UPLOAD_CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async function (file) {
        try {
          return { ok: true, file: file, note: await uploadOne(file, metadata) };
        } catch (err) {
          logger.error(`Failed to upload ${file.originalname}:`, err.message);
          return {
            ok: false,
            file: file,
            error: err.message,
          };
        }
      })
    );

    settled.forEach(function (item) {
      if (item.ok) {
        results.success.push(item.note);
      } else {
        results.failed.push({
          filename: item.file.originalname,
          error: item.error,
        });
      }
    });
  }

  return results;
}

function cleanTitle(filename) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  bulkUploadNotes,
};
