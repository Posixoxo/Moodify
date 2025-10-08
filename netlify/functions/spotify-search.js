import { getSpotifyToken } from "./spotify-token.js";
import fetch from "node-fetch";

export async function handler(event) {
  const params = event.queryStringParameters || {};
  const q = String(params.q || "").trim();
  const limit = Math.max(1, Math.min(parseInt(params.limit || "6"), 50));

  if (!q) return { statusCode: 400, body: JSON.stringify({ error: "Missing 'q'" }) };

  try {
    const token = await getSpotifyToken();

    const endpoints = [
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=playlist&limit=${limit}`
    ];

    const [trackResp, playlistResp] = await Promise.all(
      endpoints.map(u => fetch(u, { headers: { Authorization: `Bearer ${token}` } }))
    );

    const trackData = await trackResp.json().catch(() => ({ tracks: { items: [] } }));
    const playlistData = await playlistResp.json().catch(() => ({ playlists: { items: [] } }));

    const tracks = (trackData.tracks.items || []).map(track => ({
      title: track.name,
      artist: track.artists?.[0]?.name || "Unknown",
      albumArt: track.album?.images?.[0]?.url || "",
      previewUrl: track.preview_url || "",
      spotifyUrl: track.external_urls?.spotify || ""
    }));

    const playlists = (playlistData.playlists.items || []).map(pl => ({
      name: pl.name || "Untitled",
      owner: pl.owner?.display_name || "Unknown",
      image: pl.images?.[0]?.url || "",
      spotifyUrl: pl.external_urls?.spotify || ""
    }));

    return { statusCode: 200, body: JSON.stringify({ tracks, playlists }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
