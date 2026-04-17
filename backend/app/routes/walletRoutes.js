const express = require('express');
const router = express.Router();
const { getWalletDetails } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getWalletDetails);

module.exports = router;
