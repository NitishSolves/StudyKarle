const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const yearRoutes = require('./yearRoutes');
const noteRoutes = require('./noteRoutes');
const driveRoutes = require('./driveRoutes');
const savedRoutes = require('./savedRoutes');
const searchRoutes = require('./searchRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/', yearRoutes);
router.use('/', noteRoutes);
router.use('/', driveRoutes);
router.use('/saved', savedRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
