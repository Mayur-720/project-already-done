
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMyProfile,
  getUserProfileById,
  updateUserProfile,
  addFriend,
  getOwnPosts,
  processReferral,
  claimReward,
  verifyPayment,
  getReferralLeaderboard,
  recognizeUser,
  getRecognitions,
  revokeRecognition,
 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { sendWhisper, getMyWhispers, getWhisperConversation } = require('../controllers/whisperController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/process-referral', processReferral);  
router.get('/referral-leaderboard', getReferralLeaderboard);

router.post('/claim-reward', protect, claimReward);
router.get('/userposts/:userId', protect, getOwnPosts);
router.get('/profile', protect, getMyProfile);
router.get('/profile/:userId', protect, getUserProfileById);
router.post('/verify-payment', protect, verifyPayment);
router.put('/profile', protect, updateUserProfile);
router.post('/friends', protect, addFriend);

// Recognition routes
router.post('/recognize', protect, recognizeUser);
router.get('/recognitions', protect, getRecognitions);
router.post('/revoke-recognition', protect, revokeRecognition);

// Whisper routes
router.post('/whispers', protect, sendWhisper);
router.get('/whispers', protect, getMyWhispers);
router.get('/whispers/:userId', protect, getWhisperConversation);

module.exports = router;
