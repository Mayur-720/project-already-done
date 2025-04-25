
const express = require('express');
const router = express.Router();
const {
  sendBroadcastNotification,
  scheduleBroadcastNotification,
  getBroadcastHistory,
  pinPost,
  unpinPost,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes are protected and require admin privileges
router.use(protect);
router.use(isAdmin);

// Broadcast notification routes
router.post('/broadcast', sendBroadcastNotification);
router.post('/broadcast/schedule', scheduleBroadcastNotification);
router.get('/broadcast/history', getBroadcastHistory);

// Pin/unpin post routes
router.post('/posts/:id/pin', pinPost);
router.post('/posts/:id/unpin', unpinPost);

// User management routes
router.get('/users', getAllUsers);

module.exports = router;
