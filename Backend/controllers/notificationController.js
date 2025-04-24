
const asyncHandler = require('express-async-handler');
const webpush = require('web-push');
const Notification = require('../models/notificationModel');
const PushSubscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@undercover.com',
  process.env.VAPID_PUBLIC_KEY || 'BP3Plja0rVCMozxo9cURj9Zkmk_eV47DycG_eZrQsh5x025rpXH2Nzl9lXIFciCQfK89PzniwKO3tJYgwfbcVm0',
  process.env.VAPID_PRIVATE_KEY || 'nxvJqTouWBGjXjDfVR6Heot5wdS4tsQzSfYLxP-ksmc'
);

// Save a new push subscription for a user
const saveSubscription = asyncHandler(async (req, res) => {
  const subscription = req.body.subscription;
  const userId = req.user._id;

  if (!subscription || !subscription.endpoint) {
    res.status(400);
    throw new Error('Subscription data is required');
  }

  // Create or update the subscription
  await PushSubscription.findOneAndUpdate(
    { 
      user: userId, 
      'subscription.endpoint': subscription.endpoint 
    },
    { 
      user: userId,
      subscription: subscription,
      active: true 
    },
    { 
      upsert: true, 
      new: true 
    }
  );

  res.status(201).json({ message: 'Subscription saved successfully' });
});

// Get VAPID public key
const getVapidPublicKey = asyncHandler(async (req, res) => {
  res.json({ 
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BP3Plja0rVCMozxo9cURj9Zkmk_eV47DycG_eZrQsh5x025rpXH2Nzl9lXIFciCQfK89PzniwKO3tJYgwfbcVm0'
  });
});

// Get user notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'anonymousAlias avatarEmoji username')
    .limit(50);
  
  res.json(notifications);
});

// Mark notification as read
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  notification.read = true;
  await notification.save();
  
  res.json(notification);
});

// Mark all notifications as read
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  
  res.json({ message: 'All notifications marked as read' });
});

// Send push notification
const sendPushNotification = async (userId, notificationData) => {
  try {
    // Save notification to database
    const notification = await Notification.create({
      user: userId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      resourceId: notificationData.resourceId,
      resourceModel: notificationData.resourceModel,
      sender: notificationData.sender,
      url: notificationData.url,
    });

    // Get user's push subscriptions
    const subscriptions = await PushSubscription.find({ 
      user: userId,
      active: true 
    });

    if (!subscriptions.length) {
      return null; // No subscriptions found
    }

    // Send push notification to all user's devices
    const notificationPayload = {
      title: notificationData.title,
      body: notificationData.body,
      url: notificationData.url,
      data: notification,
    };

    const pushPromises = subscriptions.map(sub => {
      return webpush.sendNotification(
        sub.subscription,
        JSON.stringify(notificationPayload)
      ).catch(error => {
        console.error('Error sending push notification:', error);
        
        // Handle expired subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Mark subscription as inactive
          return PushSubscription.findByIdAndUpdate(sub._id, { active: false });
        }
      });
    });

    await Promise.all(pushPromises);
    return notification;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return null;
  }
};

module.exports = {
  saveSubscription,
  getVapidPublicKey,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendPushNotification,
};
