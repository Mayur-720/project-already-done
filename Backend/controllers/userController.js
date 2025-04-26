// Backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const generateStableCode = require('../utils/generateStableCode');
const Post = require('../models/postModel');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, referralCode } = req.body;

  if (!username || !fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user instance without explicitly setting avatarEmoji
  const user = new User({
    username,
    fullName,
    email,
    password,
    referralCode: generateStableCode(),
    referralCount: 0,
    referredBy: null,
    friends: [],
    recognizedUsers: [],
    identityRecognizers: [],
    claimedRewards: [],
  });

  // Generate unique anonymous alias
  const anonymousAlias = await user.generateAnonymousAlias();
  user.anonymousAlias = anonymousAlias;

  // Handle referral logic before saving
  let referrer = null; // Declare referrer outside the block with a default value
  if (referralCode) {
    referrer = await User.findOne({ referralCode });
    if (!referrer) {
      console.warn(`Invalid referral code: ${referralCode}`);
    } else if (referrer._id.toString() === user._id.toString()) {
      console.warn('User attempted self-referral');
    } else if (user.referredBy) {
      console.warn('User already has a referrer');
    } else {
      user.referredBy = referrer._id;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await referrer.save(); // Save referrer inside the block
    }
  }

  // Save user (this triggers the pre-save hook for avatarEmoji)
  await user.save();

  const token = generateToken(user._id);
  res.status(201).json({
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    anonymousAlias: user.anonymousAlias,
    avatarEmoji: user.avatarEmoji, // Will reflect the randomly assigned emoji
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    token,
  });
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email });

  // Special handling for admin login
  if (email === 'admin@gmail.com' && password === 'mayurisbest') {
    const token = generateToken('admin123');
    res.json({
      _id: 'admin123',
      username: 'admin',
      fullName: 'Admin User',
      email: 'admin@gmail.com',
      anonymousAlias: 'TheAdmin',
      avatarEmoji: '👑',
      role: 'admin',
      token,
    });
    return;
  }

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('Password mismatch for:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  res.json({
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    anonymousAlias: user.anonymousAlias,
    avatarEmoji: user.avatarEmoji,
    referralCount: user.referralCount,
    token,
  });
});

// ... keep existing code (other controller functions)
