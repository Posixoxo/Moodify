import { getSpotifyToken } from "./spotify-token.js";

export async function handler(event) {
  let tokenResult;
  try {
    const token = await getSpotifyToken();
    tokenResult = { ok: true, tokenLength: token.length };
  } catch (err) {
    tokenResult = { ok: false, error: err.message };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientIdExists: !!process.env.SPOTIFY_CLIENT_ID,
      clientSecretExists: !!process.env.SPOTIFY_CLIENT_SECRET,
      tokenResult
    })
  };
}
