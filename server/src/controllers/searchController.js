const noteModel = require('../models/noteModel');
const noteService = require('../services/noteService');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

module.exports = {
  search: asyncHandler(async function (req, res) {
    const query = req.query.q;
    const pagination = noteService.parsePagination(req.query);
    const results = await noteModel.search(query, pagination);
    const total = await noteModel.countSearch(query);
    return ApiResponse.ok(
      res,
      results,
      Object.assign({ query: query }, noteService.buildMeta(pagination.page, pagination.limit, total))
    );
  })
};
