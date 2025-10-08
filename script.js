/* script.js — working version with mood-mapping fixes + clickable playlists + subtle mood pulse */
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND = 'http://localhost:3000'; // adjust if your backend runs elsewhere
  const isBrowsePage = /browse\.html$/i.test(window.location.pathname) || /browse/i.test(window.location.pathname);

  /* -------------------------
     NAV / MOBILE MENU
     ------------------------- */
  const menuContainer = document.getElementById('mobile-nav-container');
  const openMenuIcon = document.querySelector('.nbar img[alt="menu-open"]');
  const closeMenuIcon = document.getElementById('menu-close-btn');
  if (openMenuIcon && menuContainer)
    openMenuIcon.addEventListener('click', () => menuContainer.classList.add('open'));
  if (closeMenuIcon && menuContainer)
    closeMenuIcon.addEventListener('click', () => menuContainer.classList.remove('open'));
  if (menuContainer)
    menuContainer.addEventListener('click', (ev) => {
      if (ev.target.id === 'mobile-nav-container')
        menuContainer.classList.remove('open');
    });

  /* -------------------------
     DARK MODE
     ------------------------- */
  const toggleButton = document.getElementById('dark-mode-toggle');
  const body = document.body;
  const localStorageKey = 'moodify-dark-mode';
  const applyTheme = (isLightModeString) => {
    const isLightMode = isLightModeString === 'true';
    if (isLightMode) {
      body.classList.add('light-mode');
      if (toggleButton) toggleButton.textContent = '🌙';
    } else {
      body.classList.remove('light-mode');
      if (toggleButton) toggleButton.textContent = '☀️';
    }
  };
  const savedTheme = localStorage.getItem(localStorageKey);
  if (savedTheme !== null) applyTheme(savedTheme);
  if (toggleButton)
    toggleButton.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const isLightMode = body.classList.contains('light-mode');
      localStorage.setItem(localStorageKey, isLightMode);
      toggleButton.textContent = isLightMode ? '🌙' : '☀️';
    });

  /* -------------------------
     ARTIST ROTATION
     ------------------------- */
  const allArtists = [
    { name: "Davido", image: "Images/David.jpg" },
    { name: "Asake", image: "Images/Asake.jpg" },
    { name: "Burna Boy", image: "Images/Burna.jpg" },
    { name: "Tems", image: "Images/Tems.jpg" },
    { name: "Wizkid", image: "Images/Wizkid.jpg" },
    { name: "Ayra Starr", image: "Images/Ayra.jpg" },
    { name: "Rema", image: "Images/Rema.jpg" },
    { name: "Adele", image: "Images/Adele.jpg" },
    { name: "Ariana Grande", image: "Images/Ariana Grande.jpg" },
    { name: "BB king", image: "Images/BB king.jpg" },
    { name: "Beyonce", image: "Images/Beyonce.jpg" },
    { name: "Billie Ellish", image: "Images/Billie Ellish.jpg" },
    { name: "Bob Marley", image: "Images/Bob Marley.jpg" },
    { name: "Daft Punk", image: "Images/Daft Punk.jpg" },
    { name: "Dua Lipa", image: "Images/Dua Lipa.jpg" },
    { name: "Eminem", image: "Images/Eminem.jpg" },
    { name: "Imagine Dragons", image: "Images/Imagine Dragons.jpg" },
    { name: "JBalvin", image: "Images/JBalvin.jpg" },
    { name: "John Legend", image: "Images/John Legend.jpg" },
    { name: "Justin Beiber", image: "Images/Justin Beiber.jpg" },
    { name: "Kamasi", image: "Images/Kamasi.jpg" },
    { name: "Kendrick Lamar", image: "Images/Kendrick Lamar.jpg" },
    { name: "Luke Bryan", image: "Images/Luke Bryan.jpg" },
    { name: "Michael Jackson", image: "Images/Michael Jackson.jpg" },
    { name: "Nathaniel Bassey", image: "Images/Nathaniel Bassey.jpg" },
    { name: "Nicki Minaj", image: "Images/Nicki Minaj.jpg" },
    { name: "Pharell", image: "Images/Pharell.jpg" },
    { name: "Shakira", image: "Images/Shakira.jpg" },
    { name: "Shawn Mendes", image: "Images/Shawn Mendes.jpg" },
    { name: "Tasha Cobbs", image: "Images/Tasha Cobbs.jpg" },
    { name: "The Chainsmokers", image: "Images/The Chainsmokers.jpg" },
    { name: "The Rolling Stones", image: "Images/The Rolling Stones.jpg" },
    { name: "The Weekend", image: "Images/The Weekend.jpg" },
    { name: "Tychomusic", image: "Images/Tychomusic.jpg" },
  ];
  const artistButtons = document.querySelectorAll('.artist-button');
  let currentIndex = 0;
  const rotationInterval = 10000;
  const rotateContent = () => {
    artistButtons.forEach((button, buttonIndex) => {
      const artistIndex = (currentIndex + buttonIndex) % allArtists.length;
      const currentArtist = allArtists[artistIndex];
      const img = button.querySelector('.img-1');
      const p = button.querySelector('p');
      if (img) { img.src = currentArtist.image; img.alt = currentArtist.name; }
      if (p) p.textContent = currentArtist.name;
    });
    currentIndex = (currentIndex + 1) % allArtists.length;
  };
  if (artistButtons && artistButtons.length) {
    rotateContent();
    setInterval(rotateContent, rotationInterval);
  }

  /* -------------------------
     LOCAL PLAYLISTS (fallback)
     ------------------------- */
  const playlists = [
    { id: 1, title: "Sunday Chill", description: "Relax with soft vibes and mellow beats.", cover: "Images/covers/chill.jpg", tags: ["chill"], time: ["weekend"], energy: ["low"], spotify: "", apple: "", audiomack: "" },
    { id: 2, title: "Study Vibes", description: "Focus with lo-fi and instrumental beats.", cover: "Images/covers/study.jpg", tags: ["chill","study"], time: ["night","morning"], energy: ["low"], spotify: "", apple: "", audiomack: "" },
    { id: 3, title: "Workout Hype", description: "Get moving with high-energy tracks.", cover: "Images/covers/workout.jpg", tags: ["workout"], time: ["morning"], energy: ["hype"], spotify: "", apple: "", audiomack: "" },
    { id: 4, title: "90s Throwback", description: "All your favorite 90s bangers in one spot.", cover: "Images/covers/90s.jpg", tags: ["90s"], time: ["weekend"], energy: ["medium"], spotify: "", apple: "", audiomack: "" },
    { id: 5, title: "Heartbreak Slow", description: "Emotional slow-tempo songs.", cover: "Images/covers/heartbreak.jpg", tags: ["heartbreak"], time: ["night"], energy: ["low"], spotify: "", apple: "", audiomack: "" }
  ];

  /* Helper: showPlaylists (now clickable) */
  function showPlaylists(list) {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      // keep your markup but add a data-url for click handler
      const url = p.spotify || p.apple || p.audiomack || p.url || p.spotifyUrl || '';
      card.innerHTML = `
        <img src="${p.cover || 'Images/default-cover.png'}" alt="${escapeHtml(p.title || '')}">
        <h3>${escapeHtml(p.title || '')}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        ${p.spotify ? `<audio controls src="${p.spotify}" class="audio-player"></audio>` : `<p style="color:gray;">Preview not available</p>`}
        <div class="platform-links">
          ${p.apple ? `<a href="${p.apple}" target="_blank">Apple Music</a>` : ''}
          ${p.audiomack ? `<a href="${p.audiomack}" target="_blank">Audiomack</a>` : ''}
        </div>
      `;
      // attach dataset url so click handler can open it
      if (url) card.dataset.openUrl = url;

      // Append then attach click handler to each card
      container.appendChild(card);
    });

    // Attach click handling once (delegation) so cards are clickable and audio clicks are ignored
    container.querySelectorAll('.playlist-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // If user clicked inside the audio player controls, do nothing
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'audio' || tag === 'source' || e.target.closest('.audio-player')) return;
        const urlToOpen = card.dataset.openUrl;
        if (!urlToOpen) return;
        window.open(urlToOpen, '_blank', 'noopener');
      });
    });
  }

  /* -------------------------
     MOOD HELPERS
     ------------------------- */
  function clearMoodClasses() {
    body.classList.remove('mood-happy','mood-chill','mood-workout','mood-heartbreak');
  }
  function setMoodBackground(mood) {
    clearMoodClasses();
    if (!mood) return;
    body.classList.add(`mood-${mood}`);
  }
  function setMoodBackgroundFromPlaylist(playlist) {
    if (!playlist || !playlist.tags) return;
    const known = ['chill','happy','workout','heartbreak'];
    const found = playlist.tags.find(t => known.includes(t));
    setMoodBackground(found);
  }

  /* -------------------------
     MOOD MAPPING (unchanged)
     ------------------------- */
  function mapToKnownMood(raw, energy = '') {
    if (!raw) {
      if (/(hype|high|energetic|party)/i.test(energy)) return 'workout';
      return 'chill';
    }
    const r = (raw || '').toString().toLowerCase();
    if (r.includes('chill') || r.includes('lo-fi') || r.includes('study') || r.includes('sleep') || r.includes('instrumental') || r.includes('jazz') || r.includes('classical') || r.includes('r & b') || r.includes('soul')) return 'chill';
    if (r.includes('happy') || r.includes('party') || r.includes('pop') || r.includes('afro') || r.includes('summer') || r.includes('dance')) return 'happy';
    if (r.includes('workout') || r.includes('hype') || r.includes('gym') || r.includes('energetic') || r.includes('high')) return 'workout';
    if (r.includes('sad') || r.includes('heart') || r.includes('heartbreak') || r.includes('emo') || r.includes('love') || r.includes('romantic') || r.includes('moody')) return 'heartbreak';
    if (/(hype|high|energetic|party)/i.test(energy)) return 'workout';
    return 'happy';
  }

  /* -------------------------
     VISUALIZER & SOFT PULSE (only on Browse page)
     ------------------------- */
  const visualizer = document.getElementById('visualizer');
  function animateVisualizer(duration = 1400) {
    if (!isBrowsePage) return; // don't animate on index page
    if (!visualizer) {
      // still do soft body pulse if visualizer missing
      triggerSoftPulse(duration);
      return;
    }
    visualizer.classList.add('active');
    if (visualizer._timeout) clearTimeout(visualizer._timeout);
    visualizer._timeout = setTimeout(() => {
      visualizer.classList.remove('active');
      visualizer._timeout = null;
    }, duration);
    // pulse body glow along with visualizer
    triggerSoftPulse(duration);
  }

  function triggerSoftPulse(duration = 1400) {
    if (!isBrowsePage) return;
    body.classList.add('mood-pulse');
    if (body._pulseTimeout) clearTimeout(body._pulseTimeout);
    body._pulseTimeout = setTimeout(() => {
      body.classList.remove('mood-pulse');
      body._pulseTimeout = null;
    }, duration + 200);
  }

  /* -------------------------
     FRONTEND SEARCH (Spotify backend)
     ------------------------- */
  const searchResultsEl = document.getElementById('search-results') || document.querySelector('.search-results');

  function detectMoodFromQuery(query) {
    if (!query) return null;
    const q = query.toLowerCase();
    if (q.includes('chill') || q.includes('lofi') || q.includes('study')) return 'chill';
    if (q.includes('happy') || q.includes('party') || q.includes('pop')) return 'happy';
    if (q.includes('workout') || q.includes('gym') || q.includes('hype')) return 'workout';
    if (q.includes('sad') || q.includes('heart') || q.includes('break')) return 'heartbreak';
    return null;
  }

  async function searchSpotify(query) {
    const resultsContainer = searchResultsEl;
    if (!resultsContainer) {
      console.error("❌ 'search-results' element not found. Make sure index.html has <div id=\"search-results\"> or class=\"search-results\".");
      return;
    }

    const detected = detectMoodFromQuery(query);
    if (detected && isBrowsePage) setMoodBackground(detected);

    resultsContainer.innerHTML = `<p>🎧 Searching Spotify for "<strong>${escapeHtml(query)}</strong>"...</p>`;
    animateVisualizer(1800);

    try {
      const response = await fetch(`${BACKEND}/api/spotify/search?q=${encodeURIComponent(query)}&limit=6`);
      if (!response.ok) throw new Error(`Spotify backend error ${response.status}`);
      const data = await response.json();

      const tracks = data.tracks || [];
      const playlistsResult = data.playlists || [];

      if (!tracks.length && !playlistsResult.length) {
        resultsContainer.innerHTML = `<p>No results found for "<strong>${escapeHtml(query)}</strong>".</p>`;
        return;
      }

      let html = `<div class="results-inner" style="max-width:900px;margin:18px auto;">`;

      if (playlistsResult.length) {
        html += `<div class="results-playlists" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:14px;">`;
        playlistsResult.forEach(pl => {
          const url = pl.spotifyUrl || (pl.external_urls && pl.external_urls.spotify) || '#';
          html += `
            <div class="result-playlist-card" style="width:220px;background:rgba(0,0,0,0.35);padding:10px;border-radius:10px;text-align:center;">
              <img src="${pl.image || 'Images/default-cover.png'}" alt="${escapeHtml(pl.name)}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;">
              <h4 style="margin:8px 0 4px;">${escapeHtml(pl.name)}</h4>
              <p style="font-size:13px;color:#ddd;margin:0 0 8px;">By ${escapeHtml(pl.owner || '')}</p>
              <a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:8px 10px;border-radius:8px;background:#1DB954;color:#fff;text-decoration:none;font-weight:600;">Open Playlist</a>
            </div>
          `;
        });
        html += `</div>`;
      }

      if (tracks.length) {
        html += `<div class="results-tracks" style="display:flex;flex-direction:column;gap:12px;">`;
        tracks.forEach((track) => {
          const img = track.albumArt || 'Images/default-cover.png';
          const title = escapeHtml(track.title || track.name || '');
          const artist = escapeHtml(track.artist || (track.artists && track.artists.join(', ')) || '');
          const album = escapeHtml(track.album || '');
          const preview = track.previewUrl || track.preview_url || '';
          const spotifyUrl = track.spotifyUrl || (track.external_urls && track.external_urls.spotify) || '#';

          const playerHtml = preview
            ? `<audio controls preload="none" src="${preview}" style="width:100%;margin-top:8px;"></audio>`
            : `<a href="${spotifyUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;padding:8px 10px;border-radius:8px;background:#1DB954;color:#fff;text-decoration:none;font-weight:600;">Play on Spotify</a>`;

          html += `
            <div class="result-track" style="display:flex;gap:12px;align-items:center;padding:10px;background:rgba(0,0,0,0.25);border-radius:10px;">
              <img src="${img}" alt="${title}" style="width:68px;height:68px;object-fit:cover;border-radius:6px;">
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
                  <div>
                    <p style="margin:0;font-weight:700;">${title}</p>
                    <p style="margin:4px 0 0;color:#ccc;font-size:14px;">${artist}${album ? ' — ' + album : ''}</p>
                  </div>
                </div>
                ${playerHtml}
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
      resultsContainer.innerHTML = html;

      // after rendering results, infer mood if we didn't detect one
      if (!detected) {
        const fallbackMood = mapToKnownMood(query);
        if (isBrowsePage) setMoodBackground(fallbackMood);
      }

      animateVisualizer(1000);
    } catch (error) {
      console.error("Spotify search error:", error);
      resultsContainer.innerHTML = `<p style="color: red;">Something went wrong while searching Spotify. Please try again later.</p>`;
    }
  }

  // small helper to escape HTML (prevents injection in inserted strings)
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) searchSpotify(query);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) searchSpotify(query);
      }
    });
  }

  /* -------------------------
     RANDOM / BUILD VIBE (Enhanced)
     ------------------------- */
  const playlistContainerEl = document.getElementById('playlist-container');
  const randomBtnEl = document.getElementById('randomVibeBtn');
  const buildBtnEl = document.getElementById('buildVibeBtn');

  const timeOptions = ['morning', 'afternoon', 'evening', 'night', 'weekend'];
  const energyOptions = ['low', 'medium', 'hype', 'high'];
  const moodOptions = ['happy', 'sad', 'chill', 'heartbreak', 'workout', 'afro', 'pop', 'hip-hop'];

  async function fetchSpotifyPlaylist(query, limit = 6) {
    try {
      const res = await fetch(`${BACKEND}/api/spotify/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!res.ok) throw new Error('Spotify backend error ' + res.status);
      const data = await res.json();
      if (data.playlists && data.playlists.length) {
        return data.playlists.map(pl => ({
          cover: pl.image || '',
          title: pl.name || '',
          description: pl.description || '',
          spotify: pl.external_urls?.spotify || pl.spotifyUrl || '',
          apple: '',
          audiomack: '',
          tags: []
        }));
      }
      if (Array.isArray(data.tracks) && data.tracks.length) {
        return data.tracks.map(t => ({
          cover: t.albumArt || '',
          title: t.title || t.name || '',
          description: (t.artist ? t.artist : (t.artists && t.artists.join(', '))) || '',
          spotify: t.previewUrl || t.spotifyUrl || '',
          apple: '',
          audiomack: '',
          tags: []
        }));
      }
      return [];
    } catch (err) {
      console.error('Spotify fetch error:', err);
      return [];
    }
  }

  async function handlePlaylistDisplay(matches) {
    if (!matches || !matches.length) {
      if (playlistContainerEl) playlistContainerEl.innerHTML = `<p>No playlists found for this vibe.</p>`;
      return;
    }
    animateVisualizer(1600);
    if (matches[0] && matches[0].tags && matches[0].tags.length) {
      setMoodBackgroundFromPlaylist(matches[0]);
    } else {
      const inferred = mapToKnownMood(matches[0].title || matches[0].description || '');
      setMoodBackground(inferred);
    }
    if (playlistContainerEl) showPlaylists(matches);
  }

  // RANDOM VIBE
  if (randomBtnEl) {
    randomBtnEl.addEventListener('click', async (e) => {
      e.preventDefault();
      animateVisualizer(1600);

      const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      const randomEnergy = energyOptions[Math.floor(Math.random() * energyOptions.length)];
      const randomMoodRaw = moodOptions[Math.floor(Math.random() * moodOptions.length)];

      const mapped = mapToKnownMood(randomMoodRaw, randomEnergy);
      if (isBrowsePage) setMoodBackground(mapped);

      const query = `${randomMoodRaw} ${randomTime} ${randomEnergy}`;
      if (playlistContainerEl)
        playlistContainerEl.innerHTML = `<p>🎲 Feeling ${escapeHtml(randomMoodRaw)}? Let’s find your vibe...</p>`;
      const found = await fetchSpotifyPlaylist(query, 8);
      await handlePlaylistDisplay(found);
    });
  }

  // BUILD MY VIBE
  if (buildBtnEl) {
    buildBtnEl.addEventListener('click', async (e) => {
      e.preventDefault();
      animateVisualizer(1600);

      const time = document.getElementById('timeOfDay')?.value || '';
      const energy = document.getElementById('energy')?.value || '';
      const moodRaw = document.getElementById('vibeMood')?.value || '';

      const normalized = mapToKnownMood(moodRaw, energy);
      if (isBrowsePage) setMoodBackground(normalized);

      const query = [moodRaw, time, energy].filter(Boolean).join(' ') || 'vibe mix';
      if (playlistContainerEl)
        playlistContainerEl.innerHTML = `<p>🎧 Building your vibe for "${escapeHtml(query)}"...</p>`;
      const found = await fetchSpotifyPlaylist(query, 8);
      await handlePlaylistDisplay(found);
    });
  }

  /* -------------------------
     STORE MOOD BUTTON CLICK
     ------------------------- */
  document.querySelectorAll('.mood-button').forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.getAttribute('data-mood');
      localStorage.setItem('selectedMood', mood);
      window.location.href = 'PickAPlatform.html';
    });
  });

}); // end DOMContentLoaded
