const express = require('express');
const router = express.Router();
const { submitKycApplication, getMe, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/kyc').post(protect, submitKycApplication);
router.route('/me').get(protect, getMe);
router.route('/avatar').post(protect, uploadAvatar);

module.exports = router;
