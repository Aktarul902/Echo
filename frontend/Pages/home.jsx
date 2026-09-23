import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const trendingSongs = [
  {
    id: "trending-1",
    title: "Midnight Dreams",
    artist: "ECHO Originals",
    artwork:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trending-2",
    title: "Neon Nights",
    artist: "ECHO Originals",
    artwork:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trending-3",
    title: "Lost In The City",
    artist: "ECHO Originals",
    artwork:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trending-4",
    title: "After Dark",
    artist: "ECHO Originals",
    artwork:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trending-5",
    title: "Electric Soul",
    artist: "ECHO Originals",
    artwork:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80",
  },
];

const moodPlaylists = [
  {
    id: "late-night",
    title: "Late Night",
    description: "For those quiet midnight moments.",
    artwork:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "focus",
    title: "Focus Mode",
    description: "Music to keep your mind locked in.",
    artwork:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "weekend",
    title: "Weekend Energy",
    description: "Turn the volume up and enjoy.",
    artwork:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  },
];

function Home() {
  /* =====================================================
     SEARCH
  ===================================================== */

  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     PLAYER
  ===================================================== */

  const [currentSong, setCurrentSong] = useState(null);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const youtubePlayerRef = useRef(null);
  const youtubeLoadingRef = useRef(false);

  const queueRef = useRef([]);
  const indexRef = useRef(0);

  const progressIntervalRef = useRef(null);

  /* =====================================================
     PLAYLISTS
  ===================================================== */

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("echoPlaylists");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      const oldPlaylist = localStorage.getItem("echoPlaylist");

      if (oldPlaylist) {
        const oldSongs = JSON.parse(oldPlaylist);

        if (Array.isArray(oldSongs) && oldSongs.length > 0) {
          return [
            {
              id: "playlist-" + Date.now(),
              name: "My Playlist",
              songs: oldSongs,
            },
          ];
        }
      }

      return [];
    } catch (error) {
      console.error("Playlist loading error:", error);
      return [];
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  /* =====================================================
     KEEP REFS UPDATED
  ===================================================== */

  useEffect(() => {
    queueRef.current = currentQueue;
  }, [currentQueue]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  /* =====================================================
     SAVE PLAYLISTS
  ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        "echoPlaylists",
        JSON.stringify(playlists)
      );

      window.dispatchEvent(
        new Event("echoPlaylistsUpdated")
      );
    } catch (error) {
      console.error("Playlist save error:", error);
    }
  }, [playlists]);

  /* =====================================================
     UPDATE PLAYLISTS FROM SONGS PAGE
  ===================================================== */

  useEffect(() => {
    const updatePlaylists = () => {
      try {
        const saved =
          localStorage.getItem("echoPlaylists");

        if (!saved) return;

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setPlaylists(parsed);
        }
      } catch (error) {
        console.error(
          "Playlist update error:",
          error
        );
      }
    };

    window.addEventListener(
      "storage",
      updatePlaylists
    );

    window.addEventListener(
      "echoPlaylistsUpdated",
      updatePlaylists
    );

    return () => {
      window.removeEventListener(
        "storage",
        updatePlaylists
      );

      window.removeEventListener(
        "echoPlaylistsUpdated",
        updatePlaylists
      );
    };
  }, []);

  /* =====================================================
     YOUTUBE PLAYER
  ===================================================== */

  useEffect(() => {
    if (!currentSong) return;

    let cancelled = false;

    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );

        if (existingScript) {
          const interval = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(interval);
              resolve();
            }
          }, 100);

          return;
        }

        const previousCallback =
          window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          if (previousCallback) {
            previousCallback();
          }

          resolve();
        };

        const script = document.createElement("script");

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(script);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();

        if (cancelled) return;

        const container = document.getElementById(
          "echo-home-youtube-player"
        );

        if (!container) {
          console.error(
            "YouTube player container not found."
          );
          return;
        }

        /*
         * Player already exists.
         * Load the new video.
         */

        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.loadVideoById(
              currentSong.id
            );

            youtubePlayerRef.current.playVideo();

            return;
          } catch (error) {
            console.error(
              "Existing player error:",
              error
            );
          }
        }

        if (youtubeLoadingRef.current) {
          return;
        }

        youtubeLoadingRef.current = true;

        youtubePlayerRef.current =
          new window.YT.Player(
            "echo-home-youtube-player",
            {
              width: "100%",
              height: "200",

              videoId: currentSong.id,

              playerVars: {
                autoplay: 1,
                playsinline: 1,
                controls: 1,
                rel: 0,
                modestbranding: 1,
              },

              events: {
                onReady: (event) => {
                  youtubeLoadingRef.current = false;

                  try {
                    event.target.playVideo();

                    setPlaying(true);

                    const videoDuration =
                      event.target.getDuration();

                    if (videoDuration) {
                      setDuration(videoDuration);
                    }
                  } catch (error) {
                    console.error(
                      "YouTube play error:",
                      error
                    );
                  }
                },

                onStateChange: (event) => {
                  if (!window.YT) return;

                  if (
                    event.data ===
                    window.YT.PlayerState.PLAYING
                  ) {
                    setPlaying(true);
                    startProgressTracking();
                  }

                  if (
                    event.data ===
                    window.YT.PlayerState.PAUSED
                  ) {
                    setPlaying(false);
                    stopProgressTracking();
                  }

                  if (
                    event.data ===
                    window.YT.PlayerState.ENDED
                  ) {
                    setPlaying(false);
                    stopProgressTracking();

                    playNext();
                  }
                },

                onError: (event) => {
                  youtubeLoadingRef.current = false;

                  console.error(
                    "YouTube player error:",
                    event.data
                  );
                },
              },
            }
          );
      } catch (error) {
        youtubeLoadingRef.current = false;

        console.error(
          "YouTube initialization error:",
          error
        );
      }
    };

    initializePlayer();

    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  /* =====================================================
     PROGRESS TRACKING
  ===================================================== */

  const startProgressTracking = () => {
    stopProgressTracking();

    progressIntervalRef.current =
      setInterval(() => {
        const player =
          youtubePlayerRef.current;

        if (!player) return;

        try {
          const time =
            player.getCurrentTime();

          const total =
            player.getDuration();

          if (typeof time === "number") {
            setCurrentTime(time);
          }

          if (typeof total === "number") {
            setDuration(total);
          }
        } catch {
          // Player not ready.
        }
      }, 500);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(
        progressIntervalRef.current
      );

      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const searchSongs = async () => {
  const query =
    search.trim() || "Bollywood songs";

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/api/youtube/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    setSongs(data);
  } catch (error) {
    console.error("Search error:", error);

    setSongs([]);

    setSearchError(
      "Unable to connect to the music server."
    );
  } finally {
    setLoading(false);
  }
};
  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      searchSongs();
    }
  };

  /* =====================================================
     PLAY SONG
  ===================================================== */

  const playSong = (
    song,
    queue = null,
    index = 0
  ) => {
    const newQueue =
      queue && queue.length > 0
        ? queue
        : [song];

    setCurrentQueue(newQueue);
    setCurrentIndex(index);

    queueRef.current = newQueue;
    indexRef.current = index;

    setCurrentTime(0);
    setDuration(0);

    setCurrentSong(song);
  };

  /* =====================================================
     NEXT
  ===================================================== */

  const playNext = () => {
    const queue = queueRef.current;
    const index = indexRef.current;

    if (!queue || queue.length === 0) {
      return;
    }

    const nextIndex = index + 1;

    if (nextIndex >= queue.length) {
      setPlaying(false);
      setCurrentTime(0);
      return;
    }

    const nextSong = queue[nextIndex];

    indexRef.current = nextIndex;

    setCurrentIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setCurrentSong(nextSong);
  };

  /* =====================================================
     PREVIOUS
  ===================================================== */

  const playPrevious = () => {
    const queue = queueRef.current;
    const index = indexRef.current;

    if (!queue || queue.length === 0) {
      return;
    }

    if (
      currentTime > 3 &&
      youtubePlayerRef.current
    ) {
      try {
        youtubePlayerRef.current.seekTo(
          0,
          true
        );

        return;
      } catch {
        // Continue.
      }
    }

    const previousIndex = index - 1;

    if (previousIndex < 0) {
      return;
    }

    const previousSong =
      queue[previousIndex];

    indexRef.current = previousIndex;

    setCurrentIndex(previousIndex);
    setCurrentTime(0);
    setDuration(0);
    setCurrentSong(previousSong);
  };

  /* =====================================================
     PLAY / PAUSE
  ===================================================== */

  const togglePlayPause = () => {
    const player =
      youtubePlayerRef.current;

    if (!player || !window.YT) {
      console.log(
        "YouTube player is not ready."
      );

      return;
    }

    try {
      const state =
        player.getPlayerState();

      if (
        state ===
        window.YT.PlayerState.PLAYING
      ) {
        player.pauseVideo();
        setPlaying(false);
      } else {
        player.playVideo();
        setPlaying(true);
      }
    } catch (error) {
      console.error(
        "Play/pause error:",
        error
      );
    }
  };

  /* =====================================================
     SEEK
  ===================================================== */

  const seekSong = (event) => {
    const value =
      Number(event.target.value);

    setCurrentTime(value);

    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.seekTo(
          value,
          true
        );
      } catch (error) {
        console.error(
          "Seek error:",
          error
        );
      }
    }
  };

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (seconds) => {
    if (
      !seconds ||
      Number.isNaN(seconds)
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  /* =====================================================
     PLAY SAVED PLAYLIST
  ===================================================== */

  const playSavedPlaylist = (
    playlist
  ) => {
    if (
      !playlist.songs ||
      playlist.songs.length === 0
    ) {
      alert("This playlist is empty.");

      return;
    }

    playSong(
      playlist.songs[0],
      playlist.songs,
      0
    );
  };

  /* =====================================================
     PLAY SAVED SONG
  ===================================================== */

  const playSavedSong = (
    playlist,
    songIndex
  ) => {
    if (
      !playlist.songs ||
      playlist.songs.length === 0
    ) {
      return;
    }

    const song =
      playlist.songs[songIndex];

    playSong(
      song,
      playlist.songs,
      songIndex
    );
  };

  /* =====================================================
     CREATE PLAYLIST
  ===================================================== */

  const createPlaylist = () => {
    const name =
      newPlaylistName.trim();

    if (!name) {
      return;
    }

    const newPlaylist = {
      id:
        "playlist-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2),

      name,

      songs: [],
    };

    setPlaylists((previous) => [
      ...previous,
      newPlaylist,
    ]);

    setNewPlaylistName("");
    setShowCreateModal(false);
  };

  /* =====================================================
     DELETE PLAYLIST
  ===================================================== */

  const deletePlaylist = (
    playlistId
  ) => {
    const playlist =
      playlists.find(
        (item) =>
          item.id === playlistId
      );

    if (!playlist) return;

    const confirmed =
      window.confirm(
        `Delete "${playlist.name}" playlist?`
      );

    if (!confirmed) return;

    setPlaylists((previous) =>
      previous.filter(
        (item) =>
          item.id !== playlistId
      )
    );
  };

  /* =====================================================
     OPEN ADD PLAYLIST MODAL
  ===================================================== */

  const openPlaylistModal = (
    song
  ) => {
    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  /* =====================================================
     ADD SONG TO PLAYLIST
  ===================================================== */

  const addSongToPlaylist = (
    playlistId
  ) => {
    if (!selectedSong) {
      return;
    }

    setPlaylists((previous) =>
      previous.map((playlist) => {
        if (
          playlist.id !==
          playlistId
        ) {
          return playlist;
        }

        const alreadyExists =
          playlist.songs.some(
            (song) =>
              song.id ===
              selectedSong.id
          );

        if (alreadyExists) {
          return playlist;
        }

        return {
          ...playlist,

          songs: [
            ...playlist.songs,
            selectedSong,
          ],
        };
      })
    );

    setShowPlaylistModal(false);
    setSelectedSong(null);
  };

  /* =====================================================
     CREATE PLAYLIST WITH SONG
  ===================================================== */

  const createPlaylistWithSong =
    () => {
      const name =
        newPlaylistName.trim();

      if (
        !name ||
        !selectedSong
      ) {
        return;
      }

      const newPlaylist = {
        id:
          "playlist-" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .slice(2),

        name,

        songs: [selectedSong],
      };

      setPlaylists((previous) => [
        ...previous,
        newPlaylist,
      ]);

      setNewPlaylistName("");
      setSelectedSong(null);
      setShowPlaylistModal(false);
    };

  /* =====================================================
     REMOVE SONG
  ===================================================== */

  const removeSongFromPlaylist = (
    playlistId,
    songId
  ) => {
    setPlaylists((previous) =>
      previous.map((playlist) => {
        if (
          playlist.id !==
          playlistId
        ) {
          return playlist;
        }

        return {
          ...playlist,

          songs:
            playlist.songs.filter(
              (song) =>
                song.id !== songId
            ),
        };
      })
    );
  };

  /* =====================================================
     HOME UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-black text-white pb-28">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <img
              src="/echo-logo.jpg"
              alt="ECHO"
              className="h-10 w-10 rounded-full object-cover"
            />

            <span className="text-2xl font-black">
              ECHO
            </span>

          </Link>

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="text-sm text-white/70 hover:text-white"
            >
              Home
            </a>

            <a
              href="#trending"
              className="text-sm text-white/70 hover:text-white"
            >
              Trending
            </a>

            <a
              href="#playlists"
              className="text-sm text-white/70 hover:text-white"
            >
              Playlists
            </a>

          </div>

          <div className="flex items-center gap-3">

            <Link
              to="/login"
              className="hidden px-4 py-2 text-sm font-semibold text-white/70 hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/signup"
              className="rounded-full bg-[#27E6B0] px-5 py-2.5 text-sm font-bold text-black hover:scale-105"
            >
              Sign up
            </Link>

          </div>

        </div>

      </nav>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        id="home"
        className="relative overflow-hidden"
      >

        <div className="absolute inset-0">

          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-[#27E6B0]/10 blur-[120px]" />

          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />

        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">

          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#27E6B0]/20 bg-[#27E6B0]/5 px-4 py-2 text-sm text-[#27E6B0]">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#27E6B0]" />

              Your music. Your ECHO.

            </div>

            <h1 className="text-5xl font-black leading-[1.02] md:text-7xl">

              Music that

              <span className="block text-[#27E6B0]">
                sounds like you.
              </span>

            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/55 md:text-xl">
              Discover music, search your favorite
              songs, create playlists and enjoy your
              personal listening experience with ECHO.
            </p>

            <div className="mt-10 max-w-2xl">

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  placeholder="Search songs, artists..."
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/30"
                />

                <button
                  onClick={searchSongs}
                  disabled={loading}
                  className="rounded-xl bg-[#27E6B0] px-6 py-3 font-bold text-black disabled:opacity-50"
                >
                  {loading
                    ? "Searching..."
                    : "Search"}
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH RESULTS
      ================================================= */}

      {songs.length > 0 && (

        <section className="mx-auto max-w-7xl px-5 pb-16">

          <div className="mb-6">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27E6B0]">
              Search
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Search Results
            </h2>

          </div>

          <div className="grid gap-3">

            {songs.map(
              (song, index) => (

                <div
                  key={`${song.id}-${index}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06]"
                >

                  <button
                    onClick={() =>
                      playSong(
                        song,
                        songs,
                        index
                      )
                    }
                    className="relative shrink-0"
                  >

                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100">
                      ▶
                    </div>

                  </button>

                  <button
                    onClick={() =>
                      playSong(
                        song,
                        songs,
                        index
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >

                    <p className="truncate font-bold">
                      {song.title}
                    </p>

                    <p className="mt-1 truncate text-sm text-white/45">
                      {song.artist}
                    </p>

                  </button>

                  <button
                    onClick={() =>
                      openPlaylistModal(song)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-white/70 hover:border-[#27E6B0] hover:text-[#27E6B0]"
                  >
                    +
                  </button>

                </div>

              )
            )}

          </div>

        </section>

      )}

      {/* =================================================
          TRENDING
      ================================================= */}

      <section
        id="trending"
        className="mx-auto max-w-7xl px-5 py-16"
      >

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27E6B0]">
            Discover
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Trending now
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

          {trendingSongs.map(
            (song, index) => (

              <div
                key={song.id}
                className="group"
              >

                <button
                  onClick={() =>
                    playSong(
                      song,
                      trendingSongs,
                      index
                    )
                  }
                  className="relative block w-full overflow-hidden rounded-2xl"
                >

                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#27E6B0] text-black">
                      ▶
                    </div>

                  </div>

                </button>

                <div className="mt-3">

                  <p className="truncate font-bold">
                    {song.title}
                  </p>

                  <p className="mt-1 truncate text-sm text-white/40">
                    {song.artist}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* =================================================
          MY PLAYLISTS
      ================================================= */}

      <section
        id="playlists"
        className="mx-auto max-w-7xl px-5 py-16"
      >

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27E6B0]">
              Your Library
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              My Playlists
            </h2>

            <p className="mt-2 text-white/45">
              Your playlists from ECHO.
            </p>

          </div>

          <button
            onClick={() =>
              setShowCreateModal(true)
            }
            className="w-fit rounded-full bg-[#27E6B0] px-6 py-3 font-bold text-black"
          >
            + Create Playlist
          </button>

        </div>

        {playlists.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#27E6B0]/10 text-3xl">
              ♪
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No playlists yet
            </h3>

            <p className="mt-2 text-white/40">
              Create your first playlist.
            </p>

            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="mt-6 rounded-full bg-[#27E6B0] px-6 py-3 font-bold text-black"
            >
              Create Playlist
            </button>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {playlists.map(
              (playlist) => {

                const firstSong =
                  playlist.songs?.[0];

                return (

                  <div
                    key={playlist.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                  >

                    <div className="relative">

                      {firstSong?.artwork ? (

                        <img
                          src={
                            firstSong.artwork
                          }
                          alt={
                            playlist.name
                          }
                          className="aspect-[16/9] w-full object-cover"
                        />

                      ) : (

                        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-[#27E6B0]/20 to-purple-500/20">

                          <span className="text-5xl text-[#27E6B0]">
                            ♪
                          </span>

                        </div>

                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                      <button
                        onClick={() =>
                          playSavedPlaylist(
                            playlist
                          )
                        }
                        disabled={
                          !playlist.songs ||
                          playlist.songs
                            .length === 0
                        }
                        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#27E6B0] text-black disabled:opacity-40"
                      >
                        ▶
                      </button>

                    </div>

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="truncate text-xl font-black">
                            {playlist.name}
                          </h3>

                          <p className="mt-1 text-sm text-white/40">
                            {playlist.songs
                              ?.length || 0}{" "}
                            {playlist.songs
                              ?.length === 1
                              ? "song"
                              : "songs"}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            deletePlaylist(
                              playlist.id
                            )
                          }
                          className="shrink-0 rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>

                      </div>

                      {playlist.songs
                        ?.length > 0 && (

                        <div className="mt-5 max-h-48 space-y-2 overflow-y-auto">

                          {playlist.songs.map(
                            (
                              song,
                              songIndex
                            ) => (

                              <div
                                key={`${song.id}-${songIndex}`}
                                className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2"
                              >

                                <button
                                  onClick={() =>
                                    playSavedSong(
                                      playlist,
                                      songIndex
                                    )
                                  }
                                >

                                  <img
                                    src={
                                      song.artwork
                                    }
                                    alt={
                                      song.title
                                    }
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />

                                </button>

                                <button
                                  onClick={() =>
                                    playSavedSong(
                                      playlist,
                                      songIndex
                                    )
                                  }
                                  className="min-w-0 flex-1 text-left"
                                >

                                  <p className="truncate text-sm font-semibold">
                                    {
                                      song.title
                                    }
                                  </p>

                                  <p className="truncate text-xs text-white/40">
                                    {
                                      song.artist
                                    }
                                  </p>

                                </button>

                                <button
                                  onClick={() =>
                                    removeSongFromPlaylist(
                                      playlist.id,
                                      song.id
                                    )
                                  }
                                  className="px-2 text-white/30 hover:text-red-400"
                                >
                                  ×
                                </button>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </section>

      {/* =================================================
          MOODS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-16">

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27E6B0]">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Find your mood
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {moodPlaylists.map(
            (playlist) => (

              <div
                key={playlist.id}
                className="group relative overflow-hidden rounded-3xl"
              >

                <img
                  src={playlist.artwork}
                  alt={playlist.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">

                  <h3 className="text-2xl font-black">
                    {playlist.title}
                  </h3>

                  <p className="mt-2 text-sm text-white/60">
                    {playlist.description}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* =================================================
          EXPERIENCE
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-20">

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-14">

          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#27E6B0]/10 blur-[100px]" />

          <div className="relative grid gap-12 md:grid-cols-2">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27E6B0]">
                ECHO Experience
              </p>

              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                Your music.
                <br />
                Your playlists.
                <br />
                Your world.
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-white/45">
                Search for music, create playlists
                and enjoy your favorite tracks with
                ECHO.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-3xl border border-white/10 bg-black/50 p-6">

                <p className="text-4xl font-black text-[#27E6B0]">
                  ∞
                </p>

                <p className="mt-3 font-bold">
                  Discover
                </p>

              </div>

              <div className="rounded-3xl border border-white/10 bg-black/50 p-6">

                <p className="text-4xl font-black text-[#27E6B0]">
                  ♪
                </p>

                <p className="mt-3 font-bold">
                  Listen
                </p>

              </div>

              <div className="rounded-3xl border border-white/10 bg-black/50 p-6">

                <p className="text-4xl font-black text-[#27E6B0]">
                  +
                </p>

                <p className="mt-3 font-bold">
                  Create
                </p>

              </div>

              <div className="rounded-3xl border border-white/10 bg-black/50 p-6">

                <p className="text-4xl font-black text-[#27E6B0]">
                  ◉
                </p>

                <p className="mt-3 font-bold">
                  ECHO
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 pb-28">

        <div className="relative overflow-hidden rounded-[2rem] bg-[#27E6B0] px-6 py-16 text-center text-black">

          <h2 className="relative text-4xl font-black md:text-6xl">
            Ready to find your ECHO?
          </h2>

          <p className="relative mx-auto mt-5 max-w-xl text-black/60">
            Create your account and start building
            your personal music experience.
          </p>

          <Link
            to="/signup"
            className="relative mt-8 inline-flex rounded-full bg-black px-8 py-4 font-bold text-white hover:scale-105"
          >
            Get started
          </Link>

        </div>

      </section>

      {/* =================================================
          CREATE PLAYLIST MODAL
      ================================================= */}

      {showCreateModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-black">
                Create Playlist
              </h3>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="text-2xl text-white/40 hover:text-white"
              >
                ×
              </button>

            </div>

            <input
              autoFocus
              value={newPlaylistName}
              onChange={(event) =>
                setNewPlaylistName(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  createPlaylist();
                }
              }}
              placeholder="Playlist name"
              className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#27E6B0]"
            />

            <div className="mt-5 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-xl px-5 py-3 text-white/60"
              >
                Cancel
              </button>

              <button
                onClick={createPlaylist}
                className="rounded-xl bg-[#27E6B0] px-5 py-3 font-bold text-black"
              >
                Create
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          ADD TO PLAYLIST MODAL
      ================================================= */}

      {showPlaylistModal &&
        selectedSong && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">

            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#101010] p-6">

              <div className="flex items-start justify-between">

                <div className="min-w-0">

                  <p className="text-sm text-[#27E6B0]">
                    Add song
                  </p>

                  <h3 className="mt-1 truncate text-2xl font-black">
                    {selectedSong.title}
                  </h3>

                </div>

                <button
                  onClick={() => {
                    setShowPlaylistModal(
                      false
                    );

                    setSelectedSong(null);
                  }}
                  className="text-2xl text-white/40"
                >
                  ×
                </button>

              </div>

              <p className="mb-3 mt-6 text-sm text-white/45">
                Choose a playlist
              </p>

              {playlists.length > 0 && (

                <div className="max-h-60 space-y-2 overflow-y-auto">

                  {playlists.map(
                    (playlist) => (

                      <button
                        key={playlist.id}
                        onClick={() =>
                          addSongToPlaylist(
                            playlist.id
                          )
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 text-left hover:border-[#27E6B0]/30"
                      >

                        <div>

                          <p className="font-bold">
                            {playlist.name}
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            {playlist.songs
                              ?.length || 0}{" "}
                            songs
                          </p>

                        </div>

                        <span className="text-xl text-[#27E6B0]">
                          +
                        </span>

                      </button>

                    )
                  )}

                </div>

              )}

              <div className="my-6 h-px bg-white/10" />

              <p className="text-sm text-white/45">
                Or create a new playlist
              </p>

              <input
                value={newPlaylistName}
                onChange={(event) =>
                  setNewPlaylistName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createPlaylistWithSong();
                  }
                }}
                placeholder="New playlist name"
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#27E6B0]"
              />

              <button
                onClick={
                  createPlaylistWithSong
                }
                className="mt-4 w-full rounded-xl bg-[#27E6B0] py-3 font-bold text-black"
              >
                Create Playlist & Add Song
              </button>

            </div>

          </div>

        )}

      {/* =================================================
          COMPACT ECHO MUSIC PLAYER
      ================================================= */}

      {currentSong && (

        <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-white/10 bg-black/95 backdrop-blur-xl">

          <div className="mx-auto flex h-[205px] max-w-7xl items-center gap-3 px-4 py-2 md:gap-4">

            {/* SONG INFO */}

            <div className="hidden w-[190px] shrink-0 items-center gap-3 sm:flex">

              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  {currentSong.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-white/40">
                  {currentSong.artist}
                </p>

              </div>

            </div>

            {/* CENTER CONTROLS */}

            <div className="flex min-w-0 flex-1 flex-col justify-center">

              {/* MOBILE SONG */}

              <div className="mb-2 flex items-center gap-2 sm:hidden">

                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  className="h-10 w-10 rounded-lg object-cover"
                />

                <div className="min-w-0">

                  <p className="truncate text-xs font-bold">
                    {currentSong.title}
                  </p>

                  <p className="truncate text-[11px] text-white/40">
                    {currentSong.artist}
                  </p>

                </div>

              </div>

              {/* CONTROLS */}

              <div className="flex items-center justify-center gap-2">

                <button
                  onClick={playPrevious}
                  title="Previous"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xs transition hover:border-[#27E6B0] hover:text-[#27E6B0]"
                >
                  ⏮
                </button>

                <button
                  onClick={
                    togglePlayPause
                  }
                  title={
                    playing
                      ? "Pause"
                      : "Play"
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#27E6B0] text-lg font-bold text-black transition hover:scale-105"
                >
                  {playing ? "Ⅱ" : "▶"}
                </button>

                <button
                  onClick={playNext}
                  title="Next"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xs transition hover:border-[#27E6B0] hover:text-[#27E6B0]"
                >
                  ⏭
                </button>

              </div>

              {/* PROGRESS */}

              <div className="mt-3 flex items-center gap-2">

                <span className="w-8 text-right text-[11px] text-white/40">
                  {formatTime(
                    currentTime
                  )}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(
                    currentTime,
                    duration ||
                      currentTime
                  )}
                  onChange={seekSong}
                  className="h-1 flex-1 cursor-pointer accent-[#27E6B0]"
                />

                <span className="w-8 text-[11px] text-white/40">
                  {formatTime(duration)}
                </span>

              </div>

            </div>

            {/* YOUTUBE PLAYER */}

            <div className="h-[200px] w-[280px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">

              <div
                id="echo-home-youtube-player"
                className="h-full w-full"
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Home;