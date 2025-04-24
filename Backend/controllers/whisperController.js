
const asyncHandler = require('express-async-handler');
const Whisper = require('../models/whisperModel');
const User = require('../models/userModel');
const { sendPushNotification } = require('./notificationController');

// @desc    Save a whisper message (for WebSocket)
const saveWhisper = asyncHandler(async ({ senderId, receiverId, content, senderAlias, senderEmoji }) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new Error('Receiver not found');
  }

  const messageCount = await Whisper.countDocuments({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  const visibilityLevel = Math.min(3, Math.floor(messageCount / 10));

  const whisper = await Whisper.create({
    sender: senderId,
    receiver: receiverId,
    content,
    senderAlias,
    senderEmoji,
    read: false,
    visibilityLevel,
  });

  // Send push notification for new message
  await sendPushNotification(receiverId, {
    title: 'New Whisper',
    body: `${senderAlias}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
    type: 'whisper',
    resourceId: whisper._id,
    resourceModel: 'Whisper',
    sender: senderId,
    url: `/chat/${senderId}`
  });

  return whisper;
});

// @desc    Send a new whisper message (REST)
// @route   POST /api/whispers
// @access  Private
const sendWhisper = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Please provide receiver and message content');
  }

  const whisper = await saveWhisper({
    senderId: req.user._id,
    receiverId,
    content,
    senderAlias: req.user.anonymousAlias,
    senderEmoji: req.user.avatarEmoji,
  });

  res.status(201).json(whisper);
});

// @desc    Get all whispers for current user
// @route   GET /api/whispers
// @access  Private
const getMyWhispers = asyncHandler(async (req, res) => {
  const conversations = await Whisper.aggregate([
    {
      $match: {
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender'],
        },
        lastMessage: { $first: '$$ROOT' },
        messages: { $push: '$$ROOT' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        unreadCount: {
          $size: {
            $filter: {
              input: '$messages',
              as: 'msg',
              cond: {
                $and: [
                  { $eq: ['$$msg.receiver', req.user._id] },
                  { $eq: ['$$msg.read', false] },
                ],
              },
            },
          },
        },
        partner: {
          _id: { $arrayElemAt: ['$userDetails._id', 0] },
          anonymousAlias: { $arrayElemAt: ['$userDetails.anonymousAlias', 0] },
          avatarEmoji: { $arrayElemAt: ['$userDetails.avatarEmoji', 0] },
          username: {
            $cond: {
              if: {
                $in: [
                  { $arrayElemAt: ['$userDetails._id', 0] },
                  req.user.recognizedUsers.map((ru) => ru.toString()),
                ],
              },
              then: { $arrayElemAt: ['$userDetails.username', 0] },
              else: null,
            },
          },
        },
      },
    },
    {
      $sort: { 'lastMessage.createdAt': -1 },
    },
  ]);

  res.json(conversations);
});

// @desc    Get whisper conversation with specific user
// @route   GET /api/whispers/:userId
// @access  Private
const getWhisperConversation = asyncHandler(async (req, res) => {
  const partnerId = req.params.userId;

  const partnerExists = await User.findById(partnerId);
  if (!partnerExists) {
    res.status(404);
    throw new Error('User not found');
  }

  const messages = await Whisper.find({
    $or: [
      { sender: req.user._id, receiver: partnerId },
      { sender: partnerId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  await Whisper.updateMany(
    { sender: partnerId, receiver: req.user._id, read: false },
    { read: true }
  );

  const hasRecognized = req.user.recognizedUsers.some(
    (ru) => ru && ru.toString() === partnerId
  );

  let partnerInfo = {
    _id: partnerExists._id,
    anonymousAlias: partnerExists.anonymousAlias,
    avatarEmoji: partnerExists.avatarEmoji,
  };

  if (hasRecognized) {
    partnerInfo.username = partnerExists.username;
  }

  res.json({
    messages,
    partner: partnerInfo,
    hasRecognized,
  });
});

module.exports = {
  sendWhisper,
  getMyWhispers,
  getWhisperConversation,
  saveWhisper,
};
