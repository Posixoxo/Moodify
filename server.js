import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- State for token management ----
let spotifyToken = null;
let tokenExpiresAt = 0;
let lastTokenError = null;
let lastTokenResponseText = null;

// Helper: small sleep
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------------- TOKEN FUNCTIONS ----------------
async function fetchSpotifyTokenWithRetry(retries = 2, delayMs = 700) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestSpotifyToken();
    } catch (err) {
      lastTokenError = err?.message || String(err);
      console.error(`Token attempt ${attempt + 1} failed:`, lastTokenError);
      if (attempt < retries) await wait(delayMs * (attempt + 1));
    }
  }
  throw new Error(`All token attempts failed: ${lastTokenError || "unknown"}`);
}

async function requestSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  console.log("→ Requesting Spotify token");
  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const text = await resp.text().catch(() => null);
  lastTokenResponseText = text?.slice ? text.slice(0, 1000) : String(text);

  if (!resp.ok) {
    console.error("🚨 Spotify token endpoint returned non-OK:", resp.status, text);
    try {
      const jsonErr = JSON.parse(text);
      throw new Error(`${jsonErr.error}: ${jsonErr.error_description}`);
    } catch {
      throw new Error(`status ${resp.status} - ${text}`);
    }
  }

  const data = JSON.parse(text);
  if (!data.access_token) throw new Error("Invalid token response");

  spotifyToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  console.log("✅ Got Spotify token (length:", spotifyToken.length, ")");
  lastTokenError = null;
  return spotifyToken;
}

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiresAt) return spotifyToken;
  return fetchSpotifyTokenWithRetry();
}

// ---------------- DEBUG ENDPOINT ----------------
app.get("/api/spotify/debug", async (req, res) => {
  const clientIdExists = !!process.env.SPOTIFY_CLIENT_ID;
  const clientSecretExists = !!process.env.SPOTIFY_CLIENT_SECRET;
  const tokenValid = !!spotifyToken && Date.now() < tokenExpiresAt;
  const expiresInSec = tokenValid ? Math.round((tokenExpiresAt - Date.now()) / 1000) : 0;

  let quickTryResult = null;
  try {
    const t = await getSpotifyToken();
    quickTryResult = { ok: true, tokenLength: String(t).length, expiresInSec };
  } catch (err) {
    quickTryResult = { ok: false, error: err.message, lastTokenError, lastTokenResponseText };
  }

  res.json({
    clientIdExists,
    clientSecretExists,
    tokenCached: !!spotifyToken,
    tokenValid,
    expiresInSec,
    quickTryResult
  });
});

// ---------------- SEARCH ENDPOINT ----------------
app.get("/api/spotify/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "6", 10) || 6, 50));

  if (!q) return res.status(400).json({ error: "Missing 'q' query parameter" });

  try {
    const token = await getSpotifyToken();

    const endpoints = [
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=playlist&limit=${limit}`
    ];

    console.log(`→ Searching Spotify for "${q}" (limit=${limit})`);
    const [trackResp, playlistResp] = await Promise.all(
      endpoints.map(u => fetch(u, { headers: { Authorization: `Bearer ${token}` } }))
    );

    const tText = await trackResp.text().catch(() => null);
    const pText = await playlistResp.text().catch(() => null);

    let trackData, playlistData;
    try { trackData = JSON.parse(tText); } catch { trackData = null; }
    try { playlistData = JSON.parse(pText); } catch { playlistData = null; }

    // 🛠 Filter out null or incomplete tracks before mapping
    const tracks = (trackData?.tracks?.items || [])
      .filter(track => track && track.name && track.artists && track.album)
      .map(track => ({
        title: track.name,
        artist: track.artists?.[0]?.name || "Unknown Artist",
        albumArt: track.album?.images?.[0]?.url || "",
        previewUrl: track.preview_url || "",
        spotifyUrl: track.external_urls?.spotify || ""
      }));

    // 🛠 Filter out null playlists
    const playlists = (playlistData?.playlists?.items || [])
      .filter(pl => pl && pl.name)
      .map(pl => ({
        name: pl.name || "Untitled Playlist",
        owner: pl.owner?.display_name || "Unknown Creator",
        image: pl.images?.[0]?.url || "",
        spotifyUrl: pl.external_urls?.spotify || ""
      }));

    res.json({ tracks, playlists });
  } catch (err) {
    console.error("Spotify search error:", err);
    res.status(500).json({ error: "Failed to fetch from Spotify", details: err.message });
  }
});

// ---------------- ROOT ----------------
app.get("/", (req, res) => res.send("Moodify backend running"));

app.listen(PORT, () => console.log(`🎧 Spotify server running on port ${PORT}`));
