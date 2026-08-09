const savedNoteModel = require('../models/savedNoteModel');
const savedFileModel = require('../models/savedFileModel');
const noteModel = require('../models/noteModel');
const driveNodeModel = require('../models/driveNodeModel');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = {
  list: asyncHandler(async function (req, res) {
    const [notes, files] = await Promise.all([
      savedNoteModel.findByUser(req.user.id),
      savedFileModel.findByUser(req.user.id),
    ]);
    return ApiResponse.ok(res, { notes: notes, files: files });
  }),

  save: asyncHandler(async function (req, res) {
    const note = await noteModel.findRawById(req.params.noteId);
    if (!note || note.status !== 'published') {
      throw ApiError.notFound('Note not found');
    }
    await savedNoteModel.create(req.user.id, req.params.noteId);
    return ApiResponse.created(res, { saved: true });
  }),

  unsave: asyncHandler(async function (req, res) {
    await savedNoteModel.remove(req.user.id, req.params.noteId);
    return ApiResponse.ok(res, { saved: false });
  }),

  fileStatus: asyncHandler(async function (req, res) {
    const node = await driveNodeModel.findFileById(req.params.nodeId);
    if (!node) {
      throw ApiError.notFound('File not found');
    }
    const saved = await savedFileModel.exists(req.user.id, req.params.nodeId);
    return ApiResponse.ok(res, { saved: saved });
  }),

  saveFile: asyncHandler(async function (req, res) {
    const node = await driveNodeModel.findFileById(req.params.nodeId);
    if (!node) {
      throw ApiError.notFound('File not found');
    }
    await savedFileModel.create(req.user.id, req.params.nodeId);
    return ApiResponse.created(res, { saved: true });
  }),

  unsaveFile: asyncHandler(async function (req, res) {
    await savedFileModel.remove(req.user.id, req.params.nodeId);
    return ApiResponse.ok(res, { saved: false });
  }),
};
