
const mongoose = require('mongoose');

// Define a comment schema to be reused in both comments and replies
const commentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  anonymousAlias: {
    type: String,
    required: true,
  },
  avatarEmoji: {
    type: String,
    default: '🎭',
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      type: mongoose.Schema.Types.Mixed, // Will recursively use the same schema
      default: [],
    }
  ]
});

// Define a media item schema for multiple photos/videos
const mediaItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    media: [mediaItemSchema], // Array of media items (images, videos)
    musicUrl: {
      type: String,
      default: '',
    },
    muteOriginalAudio: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    anonymousAlias: {
      type: String,
      required: true,
    },
    avatarEmoji: {
      type: String,
      required: true,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        anonymousAlias: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [commentSchema],
    ghostCircle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GhostCircle',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
