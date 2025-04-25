
const asyncHandler = require('express-async-handler');
const cron = require('node-cron');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const BroadcastNotification = require('../models/broadcastModel');
const { sendPushNotification } = require('./notificationController');

// Scheduled tasks cache
const scheduledTasks = new Map();

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('_id username email anonymousAlias avatarEmoji role');
  res.json(users);
});

// Send a broadcast notification to all or specific users
const sendBroadcastNotification = asyncHandler(async (req, res) => {
  const { title, body, targetGroup, targetUsers } = req.body;
  
  if (!title || !body) {
    res.status(400);
    throw new Error('Please provide title and body for the notification');
  }
  
  // Create broadcast record
  const broadcast = await BroadcastNotification.create({
    title,
    body,
    targetGroup,
    targetUsers: targetGroup === 'specific' ? targetUsers : [],
    status: 'sent',
    sentAt: new Date(),
    createdBy: req.user._id,
  });
  
  // Determine target users
  let userIds = [];
  
  if (targetGroup === 'all') {
    const users = await User.find({}).select('_id');
    userIds = users.map(user => user._id);
  } else if (targetGroup === 'specific' && Array.isArray(targetUsers)) {
    userIds = targetUsers;
  }
  
  // Send notification to each user
  const notificationPromises = userIds.map(userId => 
    sendPushNotification(userId, {
      title,
      body,
      type: 'broadcast',
      sender: req.user._id,
      url: '/',
    })
  );
  
  await Promise.all(notificationPromises);
  
  res.status(201).json(broadcast);
});

// Schedule a broadcast notification
const scheduleBroadcastNotification = asyncHandler(async (req, res) => {
  const { title, body, targetGroup, targetUsers, scheduledFor } = req.body;
  
  if (!title || !body || !scheduledFor) {
    res.status(400);
    throw new Error('Please provide title, body, and scheduled time for the notification');
  }
  
  const scheduledDate = new Date(scheduledFor);
  if (scheduledDate <= new Date()) {
    res.status(400);
    throw new Error('Scheduled time must be in the future');
  }
  
  // Create broadcast record
  const broadcast = await BroadcastNotification.create({
    title,
    body,
    targetGroup,
    targetUsers: targetGroup === 'specific' ? targetUsers : [],
    scheduledFor,
    status: 'scheduled',
    createdBy: req.user._id,
  });
  
  // Schedule the task
  const task = cron.schedule(scheduledDate, async () => {
    try {
      // Update broadcast status
      broadcast.status = 'sent';
      broadcast.sentAt = new Date();
      await broadcast.save();
      
      // Determine target users
      let userIds = [];
      
      if (targetGroup === 'all') {
        const users = await User.find({}).select('_id');
        userIds = users.map(user => user._id);
      } else if (targetGroup === 'specific' && Array.isArray(targetUsers)) {
        userIds = targetUsers;
      }
      
      // Send notification to each user
      const notificationPromises = userIds.map(userId => 
        sendPushNotification(userId, {
          title,
          body,
          type: 'broadcast',
          sender: req.user._id,
          url: '/',
        })
      );
      
      await Promise.all(notificationPromises);
      
      // Remove task from cache
      scheduledTasks.delete(broadcast._id.toString());
    } catch (error) {
      console.error('Failed to send scheduled broadcast:', error);
      
      // Update broadcast status to failed
      broadcast.status = 'failed';
      await broadcast.save();
    }
  });
  
  // Store task in memory (would need to be persisted in production)
  scheduledTasks.set(broadcast._id.toString(), task);
  
  res.status(201).json(broadcast);
});

// Get broadcast notification history
const getBroadcastHistory = asyncHandler(async (req, res) => {
  const broadcasts = await BroadcastNotification.find({})
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json(broadcasts);
});

// Pin a post
const pinPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { duration } = req.body;
  
  if (!['day', 'week', 'indefinite'].includes(duration)) {
    res.status(400);
    throw new Error('Invalid duration. Must be "day", "week", or "indefinite"');
  }
  
  const post = await Post.findById(id);
  
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  
  // Calculate pinnedUntil date based on duration
  let pinnedUntil;
  
  if (duration === 'day') {
    pinnedUntil = new Date();
    pinnedUntil.setDate(pinnedUntil.getDate() + 1); // Add 1 day
  } else if (duration === 'week') {
    pinnedUntil = new Date();
    pinnedUntil.setDate(pinnedUntil.getDate() + 7); // Add 7 days
  } else {
    pinnedUntil = null; // Indefinite
  }
  
  // Update post
  post.isPinned = true;
  post.pinnedUntil = pinnedUntil;
  post.pinnedBy = req.user._id;
  
  // Also extend the post's expiry time if needed
  if (pinnedUntil && post.expiresAt < pinnedUntil) {
    post.expiresAt = pinnedUntil;
  } else if (!pinnedUntil) {
    // For indefinite pins, extend by a very long time (e.g., 1 year)
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 1);
    post.expiresAt = farFuture;
  }
  
  await post.save();
  
  res.json(post);
});

// Unpin a post
const unpinPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  
  // Update post
  post.isPinned = false;
  post.pinnedUntil = null;
  
  // Reset expiry to default (24 hours from now) if it was extended due to pinning
  const defaultExpiry = new Date();
  defaultExpiry.setHours(defaultExpiry.getHours() + 24);
  post.expiresAt = defaultExpiry;
  
  await post.save();
  
  res.json(post);
});

module.exports = {
  sendBroadcastNotification,
  scheduleBroadcastNotification,
  getBroadcastHistory,
  pinPost,
  unpinPost,
  getAllUsers,
};
