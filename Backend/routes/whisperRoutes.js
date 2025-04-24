
const express = require('express');
const router = express.Router();
const {
  sendWhisper,
  getMyWhispers,
  getWhisperConversation,
} = require('../controllers/whisperController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/')
  .post(protect, sendWhisper)
  .get(protect, getMyWhispers);

router.get('/:userId', protect, getWhisperConversation);

module.exports = router;
