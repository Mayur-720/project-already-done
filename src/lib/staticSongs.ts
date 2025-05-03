
// Static collection of songs that can be used in posts
export interface StaticSong {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumImage: string;
  previewUrl: string;
}

export const songs: StaticSong[] = [
  {
    id: "1",
    name: "Billie Jean",
    artists: ["Michael Jackson"],
    album: "Thriller",
    albumImage: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "2",
    name: "Bohemian Rhapsody",
    artists: ["Queen"],
    album: "A Night at the Opera",
    albumImage: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "3",
    name: "Imagine",
    artists: ["John Lennon"],
    album: "Imagine",
    albumImage: "https://upload.wikimedia.org/wikipedia/en/6/69/ImagineCover.jpg",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "4",
    name: "Sweet Child O' Mine",
    artists: ["Guns N' Roses"],
    album: "Appetite for Destruction",
    albumImage: "https://upload.wikimedia.org/wikipedia/en/6/60/GunsnRosesAppetiteforDestructionalbumcover.jpg",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "5",
    name: "Smells Like Teen Spirit",
    artists: ["Nirvana"],
    album: "Nevermind",
    albumImage: "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

export const getRandomSong = (): StaticSong => {
  const randomIndex = Math.floor(Math.random() * songs.length);
  return songs[randomIndex];
};

export const getSongById = (id: string): StaticSong | undefined => {
  return songs.find(song => song.id === id);
};

export const getAllSongs = (): StaticSong[] => {
  return [...songs];
};
