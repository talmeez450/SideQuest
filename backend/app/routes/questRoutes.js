const express = require('express');
const router = express.Router();
const { 
    getQuests, 
    createQuest, 
    bookmarkQuest, 
    getSavedQuests,
    applyForQuest,
    getQuestApplicants,
    respondToApplication,
    getMyGigs,
    updateQuestStatus,
    getMyPostedQuests,
    cancelQuest,
    getQuestById,
    updateQuest
} = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getQuests)
    .post(protect, createQuest);

router.route('/saved')
    .get(protect, getSavedQuests);

router.route('/my-gigs')
    .get(protect, getMyGigs);

router.route('/manage')
    .get(protect, getMyPostedQuests);

router.route('/:id/bookmark')
    .post(protect, bookmarkQuest);

router.route('/:id/apply')
    .post(protect, applyForQuest);

router.route('/:id/applicants')
    .get(protect, getQuestApplicants);

router.route('/:id/applicants/:applicantId')
    .patch(protect, respondToApplication);

router.route('/:id/status')
    .patch(protect, updateQuestStatus);

router.route('/:id/cancel')
    .patch(protect, cancelQuest);

router.route('/:id')
    .get(protect, getQuestById)
    .put(protect, updateQuest);

module.exports = router;
