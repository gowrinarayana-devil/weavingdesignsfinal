const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/download.controller');
const { requireAuth } = require('../middleware/auth');

// Generates a temporary signed URL if order matches success state
router.post('/generate-url', downloadController.generateSignedUrl);

module.exports = router;
