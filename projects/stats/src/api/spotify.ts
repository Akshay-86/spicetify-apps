import type * as Spotify from "../types/spotify";
import { statsDebug } from "../extensions/debug";

const MAX_RATE_LIMIT_RETRIES = 0;
const RATE_LIMIT_BASE_DELAY_MS = 1000;
const RATE_LIMIT_MAX_DELAY_MS = 15000;

export const BYPASS_CLIENT_ID = "edd26169edf844db89a92b56cbb54b85";
export const BYPASS_REDIRECT_URI = "https://huangdarren1106.github.io/callback";
export const BYPASS_AUTH_URL = `https://auth.musicpiechart.com/auth/login?redirect_to=https://huangdarren1106.github.io/callback`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractAccessToken = (input: string): string | null => {
	const trimmed = input.trim();
	if (trimmed.length <= 20) return null;
	if (!trimmed.includes("access_token=")) return trimmed;

	try {
		const hashPart = trimmed.split("#")[1] ?? "";
		const queryPart = hashPart || trimmed.split("?")[1] || "";
		const params = new URLSearchParams(queryPart);
		const token = params.get("access_token");
		return token && token.length > 20 ? token : null;
	} catch {
		return null;
	}
};

export const setExternalToken = (input: string): boolean => {
	const token = extractAccessToken(input);
	if (!token) return false;
	try {
		localStorage.setItem("stats:config:oauth-token", JSON.stringify(token));
		return true;
	} catch {
		return false;
	}
};

// Get the current user's access token.
// Prefers an external OAuth token (stored in settings) which uses a separate
// Spotify app client_id -> separate rate limit bucket from CosmosAsync.
const getExternalToken = (): string | null => {
	try {
		const raw = localStorage.getItem("stats:config:oauth-token");
		if (!raw) return null;

		let value: string;
		try {
			const parsed = JSON.parse(raw);
			value = typeof parsed === "string" ? parsed : raw;
		} catch {
			value = raw;
		}

		const token = extractAccessToken(value);
		if (token && token !== value.trim()) {
			localStorage.setItem("stats:config:oauth-token", JSON.stringify(token));
		}
		return token;
	} catch {
		return null;
	}
};

const clearExternalToken = (): void => {
	try {
		localStorage.removeItem("stats:config:oauth-token");
		statsDebug.warn("External OAuth token expired and cleared. Get a new one from Settings > Rate Limit Bypass.", {});
		console.warn("[stats] External OAuth token was invalid/expired and has been cleared.");
	} catch { /* ignore */ }
};

const getAccessToken = (): string => {
	const external = getExternalToken();
	if (external) return external;
	const token = (Spicetify.Platform?.Session as { accessToken?: string })?.accessToken;
	if (!token) {
		console.error("[stats] Spotify access token not available.");
		throw new Error("Spotify access token not available. Try restarting Spotify.");
	}
	return token;
};

export const apiFetch = async <T>(name: string, url: string, log = true): Promise<T> => {
	const requestKey = `${name}:${url}`;
	statsDebug.info(`Request started: ${name}`, { url });

	for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
		try {
			const timeStart = window.performance.now();
			const isSpotifyApi = url.includes("api.spotify.com");
			const headers: Record<string, string> = { "Content-Type": "application/json" };
			if (isSpotifyApi) {
				headers["Authorization"] = `Bearer ${getAccessToken()}`;
			}

			const httpResponse = await fetch(url, { headers });

			const retryAfterHeader = httpResponse.headers.get("retry-after");
			const status = httpResponse.status;

			if (status === 429) {
				if (attempt < MAX_RATE_LIMIT_RETRIES) {
					const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : 0;
					const delay = retryAfterSec > 0
						? Math.min(retryAfterSec * 1000, RATE_LIMIT_MAX_DELAY_MS)
						: Math.min(RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt, RATE_LIMIT_MAX_DELAY_MS);
					statsDebug.setRetry({
						key: requestKey,
						name,
						url,
						attempt: attempt + 1,
						maxRetries: MAX_RATE_LIMIT_RETRIES,
						delayMs: delay,
						retryAt: Date.now() + delay,
						message: `Retry-After: ${retryAfterHeader ?? "none"}`,
					});
					statsDebug.warn(`Rate limited: ${name}. Retrying in ${delay}ms`, {
						url,
						attempt: attempt + 1,
						retryAfterHeader,
					});
					console.warn("stats -", name, `rate limited (429), retrying in ${delay}ms`);
					await sleep(delay);
					continue;
				}
				statsDebug.clearRetry(requestKey);
				statsDebug.error(`Rate limit exhausted: ${name}`, { url });
				throw new Error("Failed to fetch the info from server (status 429). Try again later.");
			}

			if (!httpResponse.ok) {
				// If 401 with external token, clear it and retry with session token
				if (httpResponse.status === 401 && getExternalToken()) {
					clearExternalToken();
					// Retry this attempt immediately with the session token
					continue;
				}
				const errorBody = await httpResponse.json().catch(() => ({})) as { error?: { message?: string } };
				const message = errorBody?.error?.message || `status ${httpResponse.status}`;
				statsDebug.clearRetry(requestKey);
				statsDebug.error(`Request failed: ${name}`, { url, status: httpResponse.status, message });
				throw new Error(
					`Failed to fetch the info from server (status ${httpResponse.status}). Try again later. ${name.includes("lfm") ? "Check your LFM API key and username." : ""}`.trim(),
				);
			}

			const data = (await httpResponse.json()) as T;
			statsDebug.clearRetry(requestKey);
			statsDebug.info(`Request succeeded: ${name}`, {
				url,
				durationMs: Math.round(window.performance.now() - timeStart),
			});
			if (log) console.log("stats -", name, "fetch time:", window.performance.now() - timeStart);
			return data;

		} catch (error) {
			// Rethrow errors we deliberately threw (terminal errors, not network glitches)
			if (error instanceof Error && (
				error.message.startsWith("Failed to fetch the info") ||
				error.message.startsWith("Spotify access token") ||
				error.message.startsWith("Spotify returned")
			)) {
				throw error;
			}
			// Network / unexpected error — retry with backoff
			if (attempt < MAX_RATE_LIMIT_RETRIES) {
				const delay = Math.min(RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt, RATE_LIMIT_MAX_DELAY_MS);
				console.warn("stats -", name, "network error, retrying in", delay, "ms:", error);
				await sleep(delay);
				continue;
			}
			statsDebug.clearRetry(requestKey);
			statsDebug.error(`Request failed: ${name}`, { url, error });
			throw error;
		}
	}

	statsDebug.clearRetry(requestKey);
	statsDebug.error(`Request failed: ${name}`, { url, status: 429, reason: "retry limit reached" });
	throw new Error("Failed to fetch the info from server (status 429). Try again later.");
};

const val = <T>(res: T | undefined) => {
	if (!res || (Array.isArray(res) && !res.length))
		throw new Error("Spotify returned an empty result. Try again later.");
	return res;
};

const f = (param: string) => {
	return encodeURIComponent(param.replace(/'/g, ""));
};

export const getTopTracks = (range: Spotify.SpotifyRange) => {
	return apiFetch<Spotify.TopTracksResponse>(
		"topTracks",
		`https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0&time_range=${range}`,
	).then((res) => val(res.items));
};

export const getTopArtists = (range: Spotify.SpotifyRange) => {
	return apiFetch<Spotify.TopArtistsResponse>(
		"topArtists",
		`https://api.spotify.com/v1/me/top/artists?limit=50&offset=0&time_range=${range}`,
	).then((res) => val(res.items));
};

/**
 * @param ids - max: 50
 */
export const getArtistMetas = (ids: string[]) => {
	return apiFetch<Spotify.SeveralArtistsResponse>("artistMetas", `https://api.spotify.com/v1/artists?ids=${ids}`).then(
		(res) => res.artists,
	);
};

export const getAlbumMetas = (ids: string[]) => {
	return apiFetch<Spotify.SeveralAlbumsResponse>("albumMetas", `https://api.spotify.com/v1/albums?ids=${ids}`).then(
		(res) => res.albums,
	);
};

export const getTrackMetas = (ids: string[]) => {
	return apiFetch<Spotify.SeveralTracksResponse>("trackMetas", `https://api.spotify.com/v1/tracks?ids=${ids}`).then(
		(res) => res.tracks,
	);
};

export const getAudioFeatures = (ids: string[]) => {
	return apiFetch<Spotify.SeveralAudioFeaturesResponse>(
		"audioFeatures",
		`https://api.spotify.com/v1/audio-features?ids=${ids}`,
	).then((res) => res.audio_features);
};

export const searchForTrack = (track: string, artist: string) => {
	return apiFetch<Spotify.SearchResponse>(
		"searchForTrack",
		`https://api.spotify.com/v1/search?q=track:${f(track)}+artist:${f(artist)}&type=track&limit=50`,
	).then((res) => res.tracks.items);
};

export const searchForArtist = (artist: string) => {
	return apiFetch<Spotify.SearchResponse>(
		"searchForArtist",
		`https://api.spotify.com/v1/search?q=artist:${f(artist)}&type=artist&limit=50`,
	).then((res) => res.artists.items);
};

export const searchForAlbum = (album: string, artist: string) => {
	return apiFetch<Spotify.SearchResponse>(
		"searchForAlbum",
		`https://api.spotify.com/v1/search?q=album:${f(album)}+artist:${f(artist)}&type=album&limit=50`,
	).then((res) => res.albums.items);
};

export const queryLiked = (ids: string[]) => {
	return apiFetch<boolean[]>("queryLiked", `https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`);
};

export const getPlaylistMeta = (id: string) => {
	return apiFetch<Spotify.PlaylistResponse>("playlistMeta", `https://api.spotify.com/v1/playlists/${id}`);
};

export const getUserPlaylists = () => {
	return apiFetch<Spotify.UserPlaylistsResponse>("userPlaylists", "https://api.spotify.com/v1/me/playlists").then(
		(res) => res.items,
	);
};
