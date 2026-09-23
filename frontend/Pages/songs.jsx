import { useEffect, useRef, useState } from "react";

function Songs() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // MULTIPLE PLAYLISTS
  // ==================================================

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("echoPlaylists");

      if (saved) {
        return JSON.parse(saved);
      }

      // Migration from old single playlist
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

  // ==================================================
  // PLAYLIST MODAL
  // ==================================================

  const [showPlaylistModal, setShowPlaylistModal] =
    useState(false);

  const [selectedSong, setSelectedSong] =
    useState(null);

  const [newPlaylistName, setNewPlaylistName] =
    useState("");

  // ==================================================
  // CURRENT PLAYER
  // ==================================================

  const [currentSong, setCurrentSong] = useState(null);

  const [currentPlaylistId, setCurrentPlaylistId] =
    useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // ==================================================
  // YOUTUBE PLAYER
  // ==================================================

  const playerRef = useRef(null);

  const [youtubeReady, setYoutubeReady] =
    useState(false);

  // ==================================================
  // REFS FOR YOUTUBE CALLBACKS
  // ==================================================

  const playlistsRef = useRef(playlists);
  const currentPlaylistIdRef =
    useRef(currentPlaylistId);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    playlistsRef.current = playlists;
  }, [playlists]);

  useEffect(() => {
    currentPlaylistIdRef.current =
      currentPlaylistId;
  }, [currentPlaylistId]);

  useEffect(() => {
    currentIndexRef.current =
      currentIndex;
  }, [currentIndex]);

  // ==================================================
  // SAVE PLAYLISTS
  // ==================================================

  useEffect(() => {
    localStorage.setItem(
      "echoPlaylists",
      JSON.stringify(playlists)
    );
  }, [playlists]);

  // ==================================================
  // LOAD YOUTUBE IFRAME API
  // ==================================================

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYoutubeReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;

      document.body.appendChild(script);
    }

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) {
        previousCallback();
      }

      setYoutubeReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady =
        previousCallback;
    };
  }, []);

  // ==================================================
  // SEARCH SONGS
  // ==================================================

  const searchSongs = async (query = search) => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/youtube/search?q=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setSongs(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DEFAULT SEARCH
  // ==================================================

  useEffect(() => {
    searchSongs("Bollywood songs");
  }, []);

  // ==================================================
  // OPEN ADD TO PLAYLIST
  // ==================================================

  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setNewPlaylistName("");
    setShowPlaylistModal(true);
  };

  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closePlaylistModal = () => {
    setShowPlaylistModal(false);
    setSelectedSong(null);
    setNewPlaylistName("");
  };

  // ==================================================
  // CREATE NEW PLAYLIST
  // ==================================================

  const createPlaylist = () => {
    const name = newPlaylistName.trim();

    if (!name) {
      return;
    }

    const newPlaylist = {
      id:
        "playlist-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2),

      name,

      songs: selectedSong
        ? [
            {
              id: selectedSong.id,
              title: selectedSong.title,
              artist: selectedSong.artist,
              artwork: selectedSong.artwork,
            },
          ]
        : [],
    };

    setPlaylists((previous) => [
      ...previous,
      newPlaylist,
    ]);

    closePlaylistModal();
  };

  // ==================================================
  // ADD SONG TO EXISTING PLAYLIST
  // ==================================================

  const addSongToPlaylist = (playlistId) => {
    if (!selectedSong) return;

    setPlaylists((previous) =>
      previous.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist;
        }

        const alreadyExists = playlist.songs.some(
          (song) => song.id === selectedSong.id
        );

        if (alreadyExists) {
          return playlist;
        }

        return {
          ...playlist,

          songs: [
            ...playlist.songs,
            {
              id: selectedSong.id,
              title: selectedSong.title,
              artist: selectedSong.artist,
              artwork: selectedSong.artwork,
            },
          ],
        };
      })
    );

    closePlaylistModal();
  };

  // ==================================================
  // REMOVE SONG FROM PLAYLIST
  // ==================================================

  const removeSongFromPlaylist = (
    playlistId,
    songId
  ) => {
    setPlaylists((previous) =>
      previous.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist;
        }

        return {
          ...playlist,

          songs: playlist.songs.filter(
            (song) => song.id !== songId
          ),
        };
      })
    );

    // Stop current song if it was removed
    if (
      currentPlaylistId === playlistId &&
      currentSong?.id === songId
    ) {
      setCurrentSong(null);
      setCurrentPlaylistId(null);
    }
  };

  // ==================================================
  // DELETE PLAYLIST
  // ==================================================

  const deletePlaylist = (playlistId) => {
    const playlist = playlists.find(
      (item) => item.id === playlistId
    );

    if (!playlist) return;

    const confirmed = window.confirm(
      `Delete "${playlist.name}" playlist?`
    );

    if (!confirmed) return;

    setPlaylists((previous) =>
      previous.filter(
        (item) => item.id !== playlistId
      )
    );

    if (currentPlaylistId === playlistId) {
      setCurrentSong(null);
      setCurrentPlaylistId(null);
      setCurrentIndex(0);
    }
  };

  // ==================================================
  // PLAY SONG FROM PLAYLIST
  // ==================================================

  const playPlaylistSong = (
    playlistId,
    song,
    index
  ) => {
    setCurrentPlaylistId(playlistId);
    setCurrentIndex(index);
    setCurrentSong(song);
  };

  // ==================================================
  // PLAY ENTIRE PLAYLIST
  // ==================================================

  const playPlaylist = (playlist) => {
    if (!playlist.songs.length) return;

    setCurrentPlaylistId(playlist.id);
    setCurrentIndex(0);
    setCurrentSong(playlist.songs[0]);
  };

  // ==================================================
  // NEXT SONG
  // ==================================================

  const playNext = () => {
    const allPlaylists = playlistsRef.current;

    const playlistId =
      currentPlaylistIdRef.current;

    const index =
      currentIndexRef.current;

    const activePlaylist = allPlaylists.find(
      (playlist) => playlist.id === playlistId
    );

    if (!activePlaylist) return;

    if (
      index >=
      activePlaylist.songs.length - 1
    ) {
      // Last song reached
      setCurrentSong(null);
      return;
    }

    const nextIndex = index + 1;

    setCurrentIndex(nextIndex);

    setCurrentSong(
      activePlaylist.songs[nextIndex]
    );
  };

  // ==================================================
  // PREVIOUS SONG
  // ==================================================

  const playPrevious = () => {
    const allPlaylists = playlistsRef.current;

    const playlistId =
      currentPlaylistIdRef.current;

    const index =
      currentIndexRef.current;

    const activePlaylist = allPlaylists.find(
      (playlist) => playlist.id === playlistId
    );

    if (!activePlaylist) return;

    if (index <= 0) return;

    const previousIndex = index - 1;

    setCurrentIndex(previousIndex);

    setCurrentSong(
      activePlaylist.songs[previousIndex]
    );
  };

  // ==================================================
  // CURRENT PLAYLIST
  // ==================================================

  const currentPlaylist = playlists.find(
    (playlist) =>
      playlist.id === currentPlaylistId
  );

  // ==================================================
  // YOUTUBE PLAYER
  // ==================================================

  useEffect(() => {
    if (!youtubeReady || !currentSong) {
      return;
    }

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerRef.current =
      new window.YT.Player(
        "echo-youtube-player",
        {
          videoId: currentSong.id,

          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 1,
            rel: 0,
          },

          events: {
            onReady: (event) => {
              event.target.playVideo();
            },

            onStateChange: (event) => {
              if (
                event.data ===
                window.YT.PlayerState.ENDED
              ) {
                playNext();
              }
            },

            onError: (event) => {
              console.error(
                "YouTube player error:",
                event.data
              );

              playNext();
            },
          },
        }
      );

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [youtubeReady, currentSong]);

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-black text-white pb-48">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="border-b border-white/10 px-6 py-5">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div className="text-2xl font-bold">
            ECHO
            <span className="text-[#27E6B0]">
              .
            </span>
          </div>

          <div className="flex gap-6 text-sm">

            <a
              href="/"
              className="text-white/70 hover:text-white"
            >
              Home
            </a>

            <a
              href="/songs"
              className="text-[#27E6B0]"
            >
              Songs
            </a>

          </div>

        </div>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <h1 className="mb-2 text-4xl font-bold">
          Discover Music
        </h1>

        <p className="mb-8 text-white/50">
          Search YouTube and build your ECHO playlists.
        </p>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-12 flex gap-3">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchSongs();
              }
            }}
            placeholder="Search Bollywood songs..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-[#27E6B0]"
          />

          <button
            onClick={() => searchSongs()}
            className="rounded-xl bg-[#27E6B0] px-7 font-semibold text-black transition hover:scale-[1.02]"
          >
            Search
          </button>

        </div>

        {/* ==================================================
            SEARCH RESULTS
        ================================================== */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Search Results
            </h2>

            <span className="text-sm text-white/40">
              {songs.length} results
            </span>

          </div>

          {loading ? (

            <div className="py-20 text-center text-white/50">
              Searching YouTube...
            </div>

          ) : (

            <div className="space-y-3">

              {songs.map((song) => {

                const addedToAnyPlaylist =
                  playlists.some((playlist) =>
                    playlist.songs.some(
                      (item) =>
                        item.id === song.id
                    )
                  );

                return (

                  <div
                    key={song.id}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.07]"
                  >

                    {/* ARTWORK */}

                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate font-semibold">
                        {song.title}
                      </h3>

                      <p className="truncate text-sm text-white/50">
                        {song.artist}
                      </p>

                    </div>

                    {/* ADD */}

                    <button
                      onClick={() =>
                        openPlaylistModal(song)
                      }
                      title="Add to playlist"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl transition ${
                        addedToAnyPlaylist
                          ? "border-[#27E6B0]/30 bg-[#27E6B0]/10 text-[#27E6B0]"
                          : "border-white/10 bg-white/5 text-white hover:border-[#27E6B0] hover:text-[#27E6B0]"
                      }`}
                    >
                      +
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </section>

        {/* ==================================================
            MY PLAYLISTS
        ================================================== */}

        <section className="mt-20">

          <div className="mb-6">

            <h2 className="text-3xl font-bold">
              My Playlists
            </h2>

            <p className="mt-1 text-white/40">
              Your personal music collection
            </p>

          </div>

          {playlists.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">

              <div className="mb-3 text-4xl">
                ♪
              </div>

              <h3 className="font-semibold">
                No playlists yet
              </h3>

              <p className="mt-2 text-sm text-white/30">
                Search for a song and click + to create
                your first playlist.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {playlists.map((playlist) => (

                <div
                  key={playlist.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                >

                  {/* PLAYLIST COVER */}

                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#27E6B0]/30 via-white/5 to-purple-500/20">

                    {playlist.songs.length > 0 ? (

                      <div className="grid h-full grid-cols-2">

                        {playlist.songs
                          .slice(0, 4)
                          .map((song) => (

                            <img
                              key={song.id}
                              src={song.id}
                              alt=""
                              className="h-full w-full object-cover"
                            />

                          ))}

                      </div>

                    ) : (

                      <div className="flex h-full items-center justify-center text-5xl text-white/20">
                        ♪
                      </div>

                    )}

                    {/* PLAY BUTTON */}

                    {playlist.songs.length > 0 && (

                      <button
                        onClick={() =>
                          playPlaylist(playlist)
                        }
                        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#27E6B0] text-xl text-black shadow-lg transition hover:scale-110"
                      >
                        ▶
                      </button>

                    )}

                  </div>

                  {/* PLAYLIST INFO */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate text-lg font-bold">
                          {playlist.name}
                        </h3>

                        <p className="mt-1 text-sm text-white/40">
                          {playlist.songs.length}{" "}
                          {playlist.songs.length === 1
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
                        className="text-white/30 transition hover:text-red-400"
                        title="Delete playlist"
                      >
                        ×
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ==================================================
            PLAYLIST SONG LISTS
        ================================================== */}

        {playlists.map((playlist) => (

          <section
            key={playlist.id}
            className="mt-12"
          >

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {playlist.name}
                </h2>

                <p className="text-sm text-white/40">
                  {playlist.songs.length} songs
                </p>

              </div>

              {playlist.songs.length > 0 && (

                <button
                  onClick={() =>
                    playPlaylist(playlist)
                  }
                  className="rounded-lg bg-[#27E6B0] px-4 py-2 text-sm font-semibold text-black"
                >
                  ▶ Play
                </button>

              )}

            </div>

            {playlist.songs.length > 0 && (

              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">

                {playlist.songs.map(
                  (song, index) => (

                    <div
                      key={song.id}
                      className={`flex items-center gap-4 border-b border-white/5 p-3 last:border-0 ${
                        currentSong?.id === song.id &&
                        currentPlaylistId ===
                          playlist.id
                          ? "bg-[#27E6B0]/10"
                          : "hover:bg-white/5"
                      }`}
                    >

                      {/* NUMBER */}

                      <span className="w-6 text-center text-sm text-white/30">
                        {index + 1}
                      </span>

                      {/* IMAGE */}

                      <img
                        src={song.artwork}
                        alt={song.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />

                      {/* INFO */}

                      <button
                        onClick={() =>
                          playPlaylistSong(
                            playlist.id,
                            song,
                            index
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >

                        <p className="truncate font-medium">
                          {song.title}
                        </p>

                        <p className="truncate text-sm text-white/40">
                          {song.artist}
                        </p>

                      </button>

                      {/* REMOVE */}

                      <button
                        onClick={() =>
                          removeSongFromPlaylist(
                            playlist.id,
                            song.id
                          )
                        }
                        className="px-3 text-xl text-white/20 hover:text-red-400"
                        title="Remove song"
                      >
                        ×
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        ))}

      </main>

      {/* ==================================================
          ADD TO PLAYLIST MODAL
      ================================================== */}

      {showPlaylistModal && selectedSong && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Add to playlist
                </h2>

                <p className="mt-1 max-w-xs truncate text-sm text-white/40">
                  {selectedSong.title}
                </p>

              </div>

              <button
                onClick={closePlaylistModal}
                className="text-2xl text-white/40 hover:text-white"
              >
                ×
              </button>

            </div>

            {/* EXISTING PLAYLISTS */}

            <div className="max-h-64 space-y-2 overflow-y-auto">

              {playlists.map((playlist) => {

                const alreadyAdded =
                  playlist.songs.some(
                    (song) =>
                      song.id ===
                      selectedSong.id
                  );

                return (

                  <button
                    key={playlist.id}
                    onClick={() =>
                      !alreadyAdded &&
                      addSongToPlaylist(
                        playlist.id
                      )
                    }
                    disabled={alreadyAdded}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      alreadyAdded
                        ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                        : "border-white/10 bg-white/5 hover:border-[#27E6B0]/50 hover:bg-[#27E6B0]/5"
                    }`}
                  >

                    <div>

                      <p className="font-medium">
                        {playlist.name}
                      </p>

                      <p className="text-xs text-white/40">
                        {playlist.songs.length} songs
                      </p>

                    </div>

                    <span className="text-[#27E6B0]">
                      {alreadyAdded
                        ? "✓"
                        : "+"}
                    </span>

                  </button>

                );
              })}

            </div>

            {/* CREATE PLAYLIST */}

            <div className="mt-5 border-t border-white/10 pt-5">

              <p className="mb-3 text-sm font-semibold">
                Create new playlist
              </p>

              <div className="flex gap-2">

                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) =>
                    setNewPlaylistName(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createPlaylist();
                    }
                  }}
                  placeholder="Playlist name..."
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#27E6B0]"
                />

                <button
                  onClick={createPlaylist}
                  className="rounded-lg bg-[#27E6B0] px-4 font-semibold text-black"
                >
                  Create
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

   {/* ==================================================
    PLAYER
================================================== */}

{currentSong && (
  <div className="fixed bottom-0 left-0 right-0 z-[100] h-[96px] bg-black border-t border-white/10 flex items-center">

    {/* ================= SONG INFO ================= */}

    <div className="flex items-center gap-4 min-w-0 flex-1 px-5">

      <img
        src={currentSong.artwork}
        alt={currentSong.title}
        className="w-[64px] h-[64px] object-cover rounded-sm flex-shrink-0"
      />

      <div className="min-w-0">
        <h3 className="text-white text-[15px] font-semibold truncate max-w-[650px]">
          {currentSong.title}
        </h3>

        <p className="text-gray-500 text-[13px] mt-1 truncate max-w-[500px]">
          {currentSong.artist}
        </p>

      </div>

    </div>


    {/* ================= CONTROLS ================= */}

    <div className="flex items-center gap-5 px-6">

      {/* PREVIOUS */}

      <button
        onClick={playPrevious}
        disabled={!currentPlaylist || currentIndex <= 0}
        className={`text-2xl transition ${
          !currentPlaylist || currentIndex <= 0
            ? "text-white/20 cursor-not-allowed"
            : "text-white hover:text-[#27E6B0]"
        }`}
        title="Previous song"
      >
        ⏮
      </button>


      {/* PLAY / PAUSE */}

      <button
        onClick={() => {
          if (!playerRef.current) return;

          const state =
            playerRef.current.getPlayerState();

          if (
            state === window.YT.PlayerState.PLAYING
          ) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black text-lg transition hover:scale-105 hover:bg-[#27E6B0]"
        title="Play / Pause"
      >
        ▶
      </button>


      {/* NEXT */}

      <button
        onClick={playNext}
        disabled={
          !currentPlaylist ||
          currentIndex >= currentPlaylist.songs.length - 1
        }
        className={`text-2xl transition ${
          !currentPlaylist ||
          currentIndex >= currentPlaylist.songs.length - 1
            ? "text-white/20 cursor-not-allowed"
            : "text-white hover:text-[#27E6B0]"
        }`}
        title="Next song"
      >
        ⏭
      </button>

    </div>


    {/* ================= YOUTUBE PLAYER ================= */}

    <div className="w-[170px] h-[96px] flex-shrink-0 overflow-hidden bg-black">

      <div
        id="echo-youtube-player"
        className="w-full h-full"
      />

    </div>

  </div>
)}

    </div>
  );
}

export default Songs;