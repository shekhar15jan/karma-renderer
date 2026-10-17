import fs from "fs";
import path from "path";
import type { ValidatedVideoRequest } from "./video-schema";

/** Bundled bed (scripts/compose-default-music.py); DEFAULT_MUSIC_PATH swaps in a channel's own track. */
function defaultMusicPath(): string {
  return process.env.DEFAULT_MUSIC_PATH || path.resolve(__dirname, "..", "..", "assets", "music", "default-bed.mp3");
}

let cached: { path: string; uri: string } | null = null;

/**
 * Gives a request without music the default bed, so a video is never narration over silence.
 * The only music provider (Gemini Lyria) needs a paid model and missions usually have no music
 * step at all. musicVolume 0 opts out.
 */
export function withDefaultMusic(request: ValidatedVideoRequest): ValidatedVideoRequest {
  if (request.music || request.musicVolume <= 0) return request;
  const file = defaultMusicPath();
  if (cached?.path !== file) {
    if (!fs.existsSync(file)) {
      console.warn(`[music] default music not found at ${file}; rendering without music`);
      return request;
    }
    cached = { path: file, uri: `data:audio/mpeg;base64,${fs.readFileSync(file).toString("base64")}` };
  }
  return { ...request, music: cached.uri };
}
