
const asyncHandler = require('express-async-handler');

const CLIENT_ID = 'f10ac80ad6d74f9abca01512f60d4810';
const CLIENT_SECRET = '657a4d42b3a8426c923f846dc61aca5d';

// Cache the token and its expiration
let spotifyToken = null;
let tokenExpiration = null;

const getSpotifyToken = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid cached token
    if (spotifyToken && tokenExpiration && Date.now() < tokenExpiration) {
      return res.json({ access_token: spotifyToken });
    }

    // Get new token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (data.access_token) {
      spotifyToken = data.access_token;
      tokenExpiration = Date.now() + (data.expires_in * 1000);
      res.json({ access_token: data.access_token });
    } else {
      res.status(400).json({ message: 'Failed to get Spotify token' });
    }
  } catch (error) {
    console.error('Spotify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const searchTracks = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get a token if we don't have one
    if (!spotifyToken || Date.now() >= tokenExpiration) {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenResponse.json();
      spotifyToken = tokenData.access_token;
      tokenExpiration = Date.now() + (tokenData.expires_in * 1000);
    }

    // Search tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      }
    );

    const searchData = await searchResponse.json();
    
    // Transform the response to match our frontend model
    const tracks = searchData.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      album_image: track.album.images[0]?.url,
      preview_url: track.preview_url,
      duration_ms: track.duration_ms
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  searchTracks,
  getSpotifyToken
};
