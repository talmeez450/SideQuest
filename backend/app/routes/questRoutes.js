const express = require('express');
const router = express.Router();
const { getQuests, createQuest, bookmarkQuest, getSavedQuests } = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getQuests)
    .post(protect, createQuest);

router.route('/saved')
    .get(protect, getSavedQuests);

router.route('/:id/bookmark')
    .post(protect, bookmarkQuest);

module.exports = router;