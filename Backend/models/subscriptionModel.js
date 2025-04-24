
const mongoose = require('mongoose');

const pushSubscriptionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscription: {
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      }
    }
  },
  active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Make endpoint unique per user
pushSubscriptionSchema.index({ user: 1, 'subscription.endpoint': 1 }, { unique: true });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
module.exports = PushSubscription;
