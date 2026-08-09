/**
 * HTTP handlers for the canonical Google Drive tree.
 *
 * The UI browses folders and opens PDFs exclusively through these endpoints,
 * keyed on the stable Drive file id. Node existence/type is validated against
 * the `drive_nodes` mirror so invalid routes return a controlled 404 instead
 * of an internal validation failure.
 */

const driveNodeService = require("../services/driveNodeService");
const driveNodeModel = require("../models/driveNodeModel");
const driveService = require("../services/driveService");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

module.exports = {
  listRoot: asyncHandler(async function (req, res) {
    const data = await driveNodeService.listRoot();
    return ApiResponse.ok(res, data);
  }),

  listFolder: asyncHandler(async function (req, res) {
    const data = await driveNodeService.listFolder(req.params.nodeId);
    return ApiResponse.ok(res, data);
  }),

  getFile: asyncHandler(async function (req, res) {
    const data = await driveNodeService.getFile(req.params.nodeId);
    return ApiResponse.ok(res, data);
  }),

  preview: asyncHandler(async function (req, res) {
    const node = await driveNodeModel.findFileById(req.params.nodeId);
    if (!node) {
      throw ApiError.notFound("File not found");
    }
    return streamDriveNode(node, res, req, "inline");
  }),

  download: asyncHandler(async function (req, res) {
    const node = await driveNodeModel.findFileById(req.params.nodeId);
    if (!node) {
      throw ApiError.notFound("File not found");
    }
    return streamDriveNode(node, res, req, "attachment");
  }),
};

// Version tag = Drive file id + Drive modified time, so a file updated in
// Drive produces a fresh ETag and the browser re-fetches the new bytes
// instead of serving a stale, long-cached copy.
function driveVersion(node) {
  if (node.modified_time) {
    return Date.parse(node.modified_time) || "v";
  }
  return "v";
}

async function streamDriveNode(node, res, req, disposition) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    disposition + '; filename="' + node.name + '"'
  );
  res.setHeader("Cache-Control", "private, max-age=300, must-revalidate");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("ETag", '"' + node.drive_id + ":" + driveVersion(node) + '"');

  if (req.headers["if-none-match"] === res.getHeader("ETag")) {
    return res.status(304).end();
  }

  await driveService.streamFile(node.drive_id, res, req.headers.range);
}
