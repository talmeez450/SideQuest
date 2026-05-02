const express = require('express');
const router = express.Router();
const { getPendingKYC, resolveKYC, getAdminStats, getGuildMembers, toggleSuspendUser, revokeUserKyc } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.route('/stats').get(protect, adminOnly, getAdminStats);
router.route('/members').get(protect, adminOnly, getGuildMembers);
router.route('/members/:id/suspend').patch(protect, adminOnly, toggleSuspendUser);
router.route('/members/:id/revoke-kyc').patch(protect, adminOnly, revokeUserKyc);
router.route('/kyc/pending').get(protect, adminOnly, getPendingKYC);
router.route('/kyc/:id').patch(protect, adminOnly, resolveKYC);

module.exports = router;
