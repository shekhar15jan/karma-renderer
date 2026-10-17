const http = require('http');
const fs = require('fs');
const payload = JSON.stringify({
  fps: 30, resolution: { width: 1920, height: 1080 }, sceneMotion: "hybrid",
  enableIntro: false, transition: "fade", transitionDuration: 15,
  scenes: [
    { visualSpec: {
      theme: "codeatcloud", layout: "architecture-diagram",
      title: "Long Label Test", subtitle: "Halo width check",
      components: [
        { id: "a", type: "microservice-node", label: "Producer" },
        { id: "b", type: "microservice-node", label: "Consumer" },
      ],
      connections: [
        { from: "a", to: "b", label: "asynchronously publishes validated events to" },
      ],
    } },
  ],
});
const opts = { hostname: 'localhost', port: 3000, path: '/video', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    if (res.statusCode !== 200) { console.log(buf.toString().slice(0,800)); process.exit(1); }
    fs.writeFileSync('./label-halo-test.mp4', buf);
    console.log('WROTE', buf.length);
  });
});
req.on('error', e => { console.error(e); process.exit(1); });
req.write(payload); req.end();
