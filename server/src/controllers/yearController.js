const yearModel = require('../models/yearModel');
const semesterModel = require('../models/semesterModel');
const subjectModel = require('../models/subjectModel');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = {
  listYears: asyncHandler(async function (req, res) {
    const years = await yearModel.findAll();
    return ApiResponse.ok(res, years);
  }),

  listSemesters: asyncHandler(async function (req, res) {
    const year = await yearModel.findById(req.params.yearId);
    if (!year) {
      throw ApiError.notFound('Year not found');
    }
    const semesters = await semesterModel.findByYearId(req.params.yearId);
    return ApiResponse.ok(res, { year: year, semesters: semesters });
  }),

  listSubjects: asyncHandler(async function (req, res) {
    const semester = await semesterModel.findByIdWithYear(req.params.semesterId);
    if (!semester) {
      throw ApiError.notFound('Semester not found');
    }
    const subjects = await subjectModel.findBySemesterId(req.params.semesterId);
    return ApiResponse.ok(res, { semester: semester, subjects: subjects });
  }),

  getSubject: asyncHandler(async function (req, res) {
    const subject = await subjectModel.findByIdWithContext(req.params.subjectId);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }
    return ApiResponse.ok(res, subject);
  })
};
