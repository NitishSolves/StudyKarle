/**
 * Service that reads the canonical Drive node tree and shapes it into the
 * public folder/file API consumed by the StudyKarle UI.
 *
 * Everything is keyed on the stable Google Drive file id, and parent/child
 * relationships come from `drive_nodes.parent_drive_id` — never from URL
 * reconstruction — so navigation is correct at any nesting depth, duplicate
 * folder names at different locations stay distinct, and mixed folders+files
 * are preserved exactly where they live in Drive.
 */

const db = require("../config/db");
const env = require("../config/env");
const driveNodeModel = require("../models/driveNodeModel");
const ApiError = require("../utils/ApiError");

const FOLDER_MIME = "application/vnd.google-apps.folder";

function toPublic(node, parentDriveId) {
  return {
    nodeId: node.drive_id,
    parentNodeId: parentDriveId || null,
    name: node.name,
    kind: node.kind,
    mimeType: node.mime_type,
    sizeBytes: node.size_bytes ? Number(node.size_bytes) : null,
    createdTime: node.created_time ? new Date(node.created_time) : null,
    modifiedTime: node.modified_time ? new Date(node.modified_time) : null,
    depth: node.depth,
    path: node.path,
  };
}

async function getRootFolderId() {
  const rootId = env.google.driveFolderId;
  if (!rootId) {
    throw ApiError.notFound("Content library is not configured");
  }
  return rootId;
}

async function getRootInfo() {
  const state = await db("drive_sync_state").where({ id: 1 }).first();
  return {
    nodeId: env.google.driveFolderId,
    name: (state && state.root_name) || "Library",
  };
}

async function buildChildren(parentDriveId) {
  const rows = await driveNodeModel.findChildren(parentDriveId);
  const folders = [];
  const files = [];
  rows.forEach(function (row) {
    const pub = toPublic(row, parentDriveId);
    if (row.kind === "folder") {
      folders.push(pub);
    } else {
      files.push(pub);
    }
  });
  return { folders: folders, files: files };
}

async function listRoot() {
  const rootId = await getRootFolderId();
  const rootInfo = await getRootInfo();
  const children = await buildChildren(rootId);

  return {
    node: {
      nodeId: rootId,
      parentNodeId: null,
      name: rootInfo.name,
      kind: "folder",
      mimeType: FOLDER_MIME,
      sizeBytes: null,
      createdTime: null,
      modifiedTime: null,
      depth: 0,
      path: rootInfo.name,
    },
    parent: null,
    ancestors: [],
    folders: children.folders,
    files: children.files,
  };
}

async function listFolder(nodeId) {
  const node = await driveNodeModel.findFolderById(nodeId);
  if (!node) {
    throw ApiError.notFound("Folder not found");
  }

  const children = await buildChildren(nodeId);
  const parent = node.parent_drive_id
    ? await driveNodeModel.findById(node.parent_drive_id)
    : null;
  const ancestors = await driveNodeModel.findAncestors(nodeId);

  return {
    node: toPublic(node, node.parent_drive_id),
    parent: parent ? toPublic(parent, parent.parent_drive_id) : null,
    ancestors: ancestors,
    folders: children.folders,
    files: children.files,
  };
}

async function getFile(nodeId) {
  const node = await driveNodeModel.findFileById(nodeId);
  if (!node) {
    throw ApiError.notFound("File not found");
  }

  const parent = node.parent_drive_id
    ? await driveNodeModel.findById(node.parent_drive_id)
    : null;
  const ancestors = await driveNodeModel.findAncestors(nodeId);

  return {
    node: toPublic(node, node.parent_drive_id),
    parent: parent ? toPublic(parent, parent.parent_drive_id) : null,
    ancestors: ancestors,
  };
}

module.exports = {
  listRoot,
  listFolder,
  getFile,
};
