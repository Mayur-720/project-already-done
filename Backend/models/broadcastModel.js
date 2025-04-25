
const mongoose = require('mongoose');

const broadcastNotificationSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  targetGroup: {
    type: String,
    enum: ['all', 'specific'],
    required: true,
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  scheduledFor: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const BroadcastNotification = mongoose.model('BroadcastNotification', broadcastNotificationSchema);
module.exports = BroadcastNotification;
