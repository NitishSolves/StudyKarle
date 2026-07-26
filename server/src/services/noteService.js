const noteModel = require("../models/noteModel");
const driveService = require("./driveService");
const ApiError = require("../utils/ApiError");
const constants = require("../config/constants");

const PDF_MAGIC_BYTES = "%PDF-";

function isLikelyPdf(buffer) {
  if (!buffer || buffer.length < PDF_MAGIC_BYTES.length) {
    return false;
  }
  return (
    buffer.slice(0, PDF_MAGIC_BYTES.length).toString("ascii") ===
    PDF_MAGIC_BYTES
  );
}

module.exports = {
  async uploadNote(file, meta, adminId) {
    if (!file) {
      throw ApiError.badRequest("A PDF file is required");
    }
    if (file.mimetype !== "application/pdf") {
      throw ApiError.badRequest("Only PDF files are supported");
    }
    if (file.size > constants.MAX_UPLOAD_BYTES) {
      throw ApiError.badRequest(
        "File exceeds the maximum allowed size of 25MB"
      );
    }
    // The MIME type above is a client-supplied header and can be spoofed.
    // Verify the actual file content starts with the PDF magic bytes before
    // accepting it, so a renamed/relabeled non-PDF file can't slip through.
    if (!isLikelyPdf(file.buffer)) {
      throw ApiError.badRequest("The uploaded file is not a valid PDF");
    }

    const driveResult = await driveService.uploadFile(
      file.buffer,
      meta.title.replace(/[^a-z0-9\-_ ]/gi, "") + ".pdf",
      file.mimetype
    );

    const note = await noteModel.create({
      subjectId: meta.subjectId,
      title: meta.title,
      description: meta.description,
      driveFileId: driveResult.driveFileId,
      fileType: "pdf",
      sizeBytes: driveResult.sizeBytes,
      status: meta.status || "published",
      uploadedBy: adminId,
    });

    return note;
  },

  async deleteNote(noteId) {
    const note = await noteModel.findRawById(noteId);
    if (!note) {
      throw ApiError.notFound("Note not found");
    }
    await driveService.deleteFile(note.drive_file_id);
    await noteModel.remove(noteId);
  },

  parsePagination(query) {
    const page = Math.max(
      1,
      parseInt(query.page, 10) || constants.PAGINATION.DEFAULT_PAGE
    );
    const rawLimit =
      parseInt(query.limit, 10) || constants.PAGINATION.DEFAULT_LIMIT;
    const limit = Math.min(rawLimit, constants.PAGINATION.MAX_LIMIT);
    const offset = (page - 1) * limit;
    return { page: page, limit: limit, offset: offset };
  },

  buildMeta(page, limit, total) {
    return {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },
};
