const express = require("express");
const { param } = require("express-validator");
const savedController = require("../controllers/savedController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { authenticatedActionLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(authenticate);
router.use(authenticatedActionLimiter);

const noteIdValidator = [
  param("noteId").isInt({ min: 1 }).withMessage("Invalid note id"),
];

// Drive file saves. `:nodeId` is a stable Drive file id (not a numeric
// StudyKarle id), so it is NOT constrained with isInt().
router.get("/drive/:nodeId/status", savedController.fileStatus);
router.post("/drive/:nodeId", savedController.saveFile);
router.delete("/drive/:nodeId", savedController.unsaveFile);

router.get("/", savedController.list);
router.post("/:noteId", noteIdValidator, validate, savedController.save);
router.delete("/:noteId", noteIdValidator, validate, savedController.unsave);

module.exports = router;
