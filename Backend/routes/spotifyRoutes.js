
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { searchTracks, getSpotifyToken } = require('../controllers/spotifyController');

router.get('/search', protect, searchTracks);
router.get('/token', protect, getSpotifyToken);

module.exports = router;
