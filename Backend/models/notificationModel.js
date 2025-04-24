
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'whisper', 'system'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel',
  },
  resourceModel: {
    type: String,
    enum: ['Post', 'Comment', 'Whisper'],
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  url: {
    type: String,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
