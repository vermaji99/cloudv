const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadata.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All metadata routes are protected

router.get('/validation-rules', metadataController.getValidationRules);
router.patch('/validation-rule/:id', metadataController.toggleValidationRule);
router.post('/validation-rules/bulk', metadataController.bulkUpdateValidationRules);

module.exports = router;
