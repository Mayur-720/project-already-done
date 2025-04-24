
const express = require('express');
const router = express.Router();
const {
  saveSubscription,
  getVapidPublicKey,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/vapid-public-key', getVapidPublicKey);

// Protected routes
router.route('/subscription')
  .post(protect, saveSubscription);

router.route('/')
  .get(protect, getUserNotifications);

router.route('/:id/read')
  .put(protect, markNotificationRead);

router.route('/read-all')
  .put(protect, markAllNotificationsRead);

module.exports = router;
