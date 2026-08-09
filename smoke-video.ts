/** Smoke test - exercises POST /video with two scenes carrying real audio data URIs. */

import http from "http";

function makeWavDataUri(seconds: number, freq = 440, sampleRate = 8000): string {
  const samples = Math.floor(seconds * sampleRate);
  const dataSize = samples;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate, 28);
  buf.writeUInt16LE(1, 32);
  buf.writeUInt16LE(8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const v = Math.round(127 + 120 * Math.sin(2 * Math.PI * freq * t));
    buf[44 + i] = v;
  }
  return `data:audio/wav;base64,${buf.toString("base64")}`;
}

function postVideo(payload: unknown): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "localhost",
        port: 3210,
        path: "/video",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
        timeout: 600000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }));
      },
    );
    req.on("error", reject);
    req.on("timeout", () => reject(new Error("request timeout")));
    req.end(body);
  });
}

async function main() {
  const audio1 = makeWavDataUri(0.7, 440);
  const audio2 = makeWavDataUri(0.5, 660);

  const payload = {
    fps: 30,
    resolution: { width: 640, height: 360 },
    transitionDuration: 10,
    enableIntro: true,
    introTitle: "Karma Smoke",
    introSubtitle: "Remotion engine",
    scenes: [
      {
        visualSpec: {
          layout: "flow",
          theme: "whiteboard",
          title: "Scene One",
          components: [
            { id: "a", type: "box", label: "Hello" },
            { id: "b", type: "box", label: "World" },
          ],
          connections: [{ from: "a", to: "b", label: "flow", style: "straight" }],
        },
        audio: audio1,
      },
      {
        visualSpec: {
          layout: "cards",
          theme: "dark",
          components: [
            { type: "card", label: "Card A", items: ["x", "y"] },
            { type: "stat-card", label: "Usage", data: { value: "42", unit: "%" } },
          ],
        },
        audio: audio2,
      },
    ],
  };

  const { status, headers, body } = await postVideo(payload);
  console.log("status:", status);
  console.log("content-type:", headers["content-type"]);
  console.log("x-karma-renderer:", headers["x-karma-renderer"]);
  console.log("x-karma-video-duration:", headers["x-karma-video-duration"]);
  console.log("bytes:", body.length);
  if (status !== 200) {
    console.log("body:", body.toString("utf8").slice(0, 2000));
    process.exit(1);
  }
  const fs = await import("fs");
  fs.writeFileSync("smoke-video.mp4", body);
  console.log("wrote smoke-video.mp4");
}

main().catch((e) => {
  console.error("SMOKE FAILED:", e);
  process.exit(1);
});
