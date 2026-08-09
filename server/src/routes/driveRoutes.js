const express = require("express");
const driveController = require("../controllers/driveController");
const authenticate = require("../middleware/authenticate");
const { authenticatedActionLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(authenticate);
router.use(authenticatedActionLimiter);

// Google Drive tree browsing. `:nodeId` is a stable Google Drive file id
// (not a numeric StudyKarle id), so it is NOT constrained with isInt().
router.get("/drive", driveController.listRoot);
router.get("/drive/nodes/:nodeId", driveController.listFolder);
router.get("/drive/files/:nodeId", driveController.getFile);
router.get("/drive/files/:nodeId/preview", driveController.preview);
router.get("/drive/files/:nodeId/download", driveController.download);

module.exports = router;
