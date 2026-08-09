const noteModel = require("../models/noteModel");
const viewHistoryModel = require("../models/viewHistoryModel");
const driveService = require("../services/driveService");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

module.exports = {
  getById: asyncHandler(async function (req, res) {
    const note = await noteModel.findById(req.params.noteId);
    if (!note || note.status !== "published") {
      throw ApiError.notFound("Note not found");
    }
    return ApiResponse.ok(res, note);
  }),

  preview: asyncHandler(async function (req, res) {
    const note = await noteModel.findRawById(req.params.noteId);
    if (!note || note.status !== "published") {
      throw ApiError.notFound("Note not found");
    }

    // Don't block the PDF stream on the view-history write.
    viewHistoryModel.record(req.user.id, note.id).catch(function () {});

    // Version tag = Drive file id + Drive modified time, so a file updated in
    // Drive produces a fresh ETag and the browser re-fetches the new bytes
    // instead of serving a stale, long-cached copy.
    const etag = '"' + note.drive_file_id + ":" + driveVersion(note) + '"';
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + note.title + '.pdf"'
    );
    // Short, revalidating cache: previews are fast (304 when unchanged) while
    // still picking up Drive updates within the cache window.
    res.setHeader("Cache-Control", "private, max-age=300, must-revalidate");
    res.setHeader("ETag", etag);
    res.setHeader("Accept-Ranges", "bytes");

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    await driveService.streamFile(note.drive_file_id, res, req.headers.range);
  }),

  download: asyncHandler(async function (req, res) {
    const note = await noteModel.findRawById(req.params.noteId);
    if (!note || note.status !== "published") {
      throw ApiError.notFound("Note not found");
    }
    const etag = '"' + note.drive_file_id + ":" + driveVersion(note) + '"';
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + note.title + '.pdf"'
    );
    res.setHeader("Cache-Control", "private, max-age=300, must-revalidate");
    res.setHeader("ETag", etag);
    res.setHeader("Accept-Ranges", "bytes");

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    await driveService.streamFile(note.drive_file_id, res, req.headers.range);
  }),
};

// Stable, content-aware version string used in the ETag.
function driveVersion(note) {
  if (note.drive_modified_time) {
    return Date.parse(note.drive_modified_time) || "v";
  }
  if (note.updated_at) {
    return Date.parse(note.updated_at) || "v";
  }
  return "v";
}
