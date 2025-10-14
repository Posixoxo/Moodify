// netlify/functions/spotify-search.js
import { getSpotifyToken } from "./spotify-token.js";
import fetch from "node-fetch";

export async function handler(event) {
  console.log('🎵 spotify-search function called');
  console.log('Query params:', event.queryStringParameters);

  const params = event.queryStringParameters || {};
  const q = String(params.q || "").trim();
  const limit = Math.max(1, Math.min(parseInt(params.limit || "6"), 50));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!q) {
    console.log('❌ No query provided');
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: "Missing 'q' parameter" }) 
    };
  }

  try {
    console.log(`🔍 Searching for: "${q}" with limit: ${limit}`);
    
    // Get token from your existing spotify-token function
    console.log('📡 Getting Spotify token...');
    const token = await getSpotifyToken();
    console.log('✅ Got token');

    const endpoints = [
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=playlist&limit=${limit}`
    ];

    console.log('🔍 Fetching from Spotify API...');
    const [trackResp, playlistResp] = await Promise.all(
      endpoints.map(u => fetch(u, { headers: { Authorization: `Bearer ${token}` } }))
    );

    console.log('Track response status:', trackResp.status);
    console.log('Playlist response status:', playlistResp.status);

    const trackData = await trackResp.json().catch(() => ({ tracks: { items: [] } }));
    const playlistData = await playlistResp.json().catch(() => ({ playlists: { items: [] } }));

    // ✅ FIX: Filter out null/undefined items and handle missing properties safely
    const tracks = (trackData.tracks?.items || [])
      .filter(track => track && track.name) // Remove null items
      .map(track => ({
        title: track.name,
        name: track.name,
        artist: track.artists?.[0]?.name || "Unknown",
        artists: track.artists?.map(a => a.name) || [],
        album: track.album?.name || "",
        albumArt: track.album?.images?.[0]?.url || "",
        previewUrl: track.preview_url || "",
        preview_url: track.preview_url || "",
        spotifyUrl: track.external_urls?.spotify || "",
        external_urls: track.external_urls || {}
      }));

    // ✅ FIX: Filter out null/undefined playlists
    const playlists = (playlistData.playlists?.items || [])
      .filter(pl => pl && pl.name) // Remove null items
      .map(pl => ({
        name: pl.name || "Untitled",
        description: pl.description || "",
        owner: pl.owner?.display_name || "Unknown",
        image: pl.images?.[0]?.url || "",
        spotifyUrl: pl.external_urls?.spotify || "",
        external_urls: pl.external_urls || {}
      }));

    console.log(`✅ Found ${tracks.length} tracks and ${playlists.length} playlists`);

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ 
        success: true,
        tracks, 
        playlists,
        total: {
          tracks: tracks.length,
          playlists: playlists.length
        }
      }) 
    };

  } catch (err) {
    console.error('❌ Error in spotify-search:', err);
    console.error('Error stack:', err.stack);
    
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: err.message,
        details: err.stack
      }) 
    };
  }
}