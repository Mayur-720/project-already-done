
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Music, Search, X } from 'lucide-react';
import { SpotifyTrack } from '@/types';

interface SpotifyMusicSelectorProps {
  onSelectTrack: (track: SpotifyTrack | null) => void;
  selectedTrack: SpotifyTrack | null;
}

const SpotifyMusicSelector: React.FC<SpotifyMusicSelectorProps> = ({ onSelectTrack, selectedTrack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('spotify-api-key') || '');
  const [savedApiKey, setSavedApiKey] = useState(!!localStorage.getItem('spotify-api-key'));
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchSpotify = async () => {
    if (!searchQuery.trim() || !apiKey) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid or expired API key. Please update your Spotify API key.');
          localStorage.removeItem('spotify-api-key');
          setSavedApiKey(false);
        } else {
          setError(`Error from Spotify API: ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      
      const tracks: SpotifyTrack[] = data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => artist.name),
        album: track.album.name,
        album_image: track.album.images[0]?.url,
        preview_url: track.preview_url,
        duration_ms: track.duration_ms
      }));
      
      setSearchResults(tracks);
    } catch (error) {
      console.error('Error searching Spotify:', error);
      setError('Failed to search Spotify. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('spotify-api-key', apiKey);
      setSavedApiKey(true);
      setError(null);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('spotify-api-key');
    setApiKey('');
    setSavedApiKey(false);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    onSelectTrack(track);
  };

  const handleRemoveTrack = () => {
    onSelectTrack(null);
  };

  return (
    <div className="space-y-4">
      {!savedApiKey ? (
        <div className="border border-dashed border-gray-300 rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Spotify API Key Required</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your Spotify API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveApiKey} disabled={!apiKey}>Save</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your API key will be stored in your browser for this session.
          </p>
        </div>
      ) : (
        <>
          {selectedTrack ? (
            <div className="border rounded-md p-4">
              <div className="flex items-center gap-3">
                {selectedTrack.album_image ? (
                  <img 
                    src={selectedTrack.album_image} 
                    alt={selectedTrack.album}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Music size={24} className="text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{selectedTrack.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedTrack.artists.join(', ')} • {selectedTrack.album}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveTrack}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
              {selectedTrack.preview_url && (
                <div className="mt-3">
                  <audio 
                    controls 
                    src={selectedTrack.preview_url}
                    className="w-full h-8"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for a song"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchSpotify()}
                    className="pr-10"
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <Button onClick={searchSpotify} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="link" size="sm" onClick={clearApiKey} className="h-auto p-0">
                    Update API Key
                  </Button>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                        onClick={() => handleSelectTrack(track)}
                      >
                        {track.album_image ? (
                          <img 
                            src={track.album_image} 
                            alt={track.album}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <Music size={20} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{track.name}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            {track.artists.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SpotifyMusicSelector;
