const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:questId/:otherUserId')
    .get(protect, getChatHistory);

router.route('/:questId/:receiverId')
    .post(protect, sendMessage);

module.exports = router;
