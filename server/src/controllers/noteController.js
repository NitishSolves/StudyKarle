const noteModel = require('../models/noteModel');
const subjectModel = require('../models/subjectModel');
const viewHistoryModel = require('../models/viewHistoryModel');
const driveService = require('../services/driveService');
const noteService = require('../services/noteService');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = {
  listBySubject: asyncHandler(async function (req, res) {
    const subject = await subjectModel.findById(req.params.subjectId);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }
    const pagination = noteService.parsePagination(req.query);
    const notes = await noteModel.findBySubjectId(req.params.subjectId, pagination);
    const total = await noteModel.countBySubjectId(req.params.subjectId);
    return ApiResponse.ok(res, notes, noteService.buildMeta(pagination.page, pagination.limit, total));
  }),

  recent: asyncHandler(async function (req, res) {
    const limit = parseInt(req.query.limit, 10) || 5;
    const notes = await noteModel.findRecent(limit);
    return ApiResponse.ok(res, notes);
  }),

  getById: asyncHandler(async function (req, res) {
    const note = await noteModel.findById(req.params.noteId);
    if (!note || note.status !== 'published') {
      throw ApiError.notFound('Note not found');
    }
    return ApiResponse.ok(res, note);
  }),

  preview: asyncHandler(async function (req, res) {
    const note = await noteModel.findRawById(req.params.noteId);
    if (!note || note.status !== 'published') {
      throw ApiError.notFound('Note not found');
    }

    await viewHistoryModel.record(req.user.id, note.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + note.title + '.pdf"');
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache');
    await driveService.streamFile(note.drive_file_id, res);
  }),

  download: asyncHandler(async function (req, res) {
    const note = await noteModel.findRawById(req.params.noteId);
    if (!note || note.status !== 'published') {
      throw ApiError.notFound('Note not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + note.title + '.pdf"');
    await driveService.streamFile(note.drive_file_id, res);
  })
};
