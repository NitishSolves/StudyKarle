const yearModel = require("../models/yearModel");
const semesterModel = require("../models/semesterModel");
const subjectModel = require("../models/subjectModel");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

module.exports = {
  listYears: asyncHandler(async function (req, res) {
    const years = await yearModel.findAll();
    return ApiResponse.ok(res, years);
  }),

  listSemesters: asyncHandler(async function (req, res) {
    const yearId = parseInt(req.params.yearId, 10);
    if (isNaN(yearId)) {
      throw ApiError.badRequest("Invalid year id");
    }

    const year = await yearModel.findById(yearId);
    if (!year) {
      throw ApiError.notFound("Year not found");
    }

    const semesters = await semesterModel.findByYearId(yearId);
    return ApiResponse.ok(res, { year: year, semesters: semesters });
  }),

  getSubjectUnits: asyncHandler(async function (req, res) {
    const subjectId = parseInt(req.params.subjectId, 10);
    if (isNaN(subjectId)) {
      throw ApiError.badRequest("Invalid subject id");
    }

    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      throw ApiError.notFound("Subject not found");
    }

    const unitModel = require("../models/unitModel");
    const units = await unitModel.findTreeBySubjectId(subjectId);
    return ApiResponse.ok(res, units);
  }),
};
