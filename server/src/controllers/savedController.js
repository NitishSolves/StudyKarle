const savedNoteModel = require('../models/savedNoteModel');
const noteModel = require('../models/noteModel');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = {
  list: asyncHandler(async function (req, res) {
    const saved = await savedNoteModel.findByUser(req.user.id);
    return ApiResponse.ok(res, saved);
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
  })
};
