import fetch from "node-fetch";

let spotifyToken = null;
let tokenExpiresAt = 0;
const wait = ms => new Promise(r => setTimeout(r, ms));

export async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiresAt) return spotifyToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing Spotify credentials");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      const data = await resp.json();
      if (!data.access_token) throw new Error("Invalid token response");

      spotifyToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return spotifyToken;
    } catch (err) {
      if (attempt === 2) throw err;
      await wait(700 * (attempt + 1));
    }
  }
}
