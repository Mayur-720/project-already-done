
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Music, X } from 'lucide-react';
import { StaticSong, getAllSongs, getRandomSong } from '@/lib/staticSongs';

interface SongSelectorProps {
  onSelectSong: (song: StaticSong | null) => void;
  selectedSong: StaticSong | null;
}

const SongSelector: React.FC<SongSelectorProps> = ({ onSelectSong, selectedSong }) => {
  const [showList, setShowList] = useState(false);
  const songs = getAllSongs();
  
  const handleSelectSong = (song: StaticSong) => {
    onSelectSong(song);
    setShowList(false);
  };

  const handleSelectRandom = () => {
    const randomSong = getRandomSong();
    onSelectSong(randomSong);
    setShowList(false);
  };

  const handleRemoveSong = () => {
    onSelectSong(null);
  };

  return (
    <div className="space-y-4">
      {selectedSong ? (
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-3">
            {selectedSong.albumImage ? (
              <img 
                src={selectedSong.albumImage} 
                alt={selectedSong.album}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <Music size={24} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{selectedSong.name}</h3>
              <p className="text-xs text-gray-500 truncate">
                {selectedSong.artists.join(', ')} • {selectedSong.album}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveSong}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
          {selectedSong.previewUrl && (
            <div className="mt-3">
              <audio 
                controls 
                src={selectedSong.previewUrl}
                className="w-full h-8"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowList(!showList)} className="flex-grow">
              {showList ? 'Hide Songs' : 'Choose a Song'}
            </Button>
            <Button onClick={handleSelectRandom} variant="secondary">
              Random Song
            </Button>
          </div>
          
          {showList && (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => handleSelectSong(song)}
                  >
                    {song.albumImage ? (
                      <img 
                        src={song.albumImage} 
                        alt={song.album}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Music size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{song.name}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {song.artists.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SongSelector;
