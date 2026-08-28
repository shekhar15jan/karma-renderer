const http = require('http');
const fs = require('fs');
const payload = JSON.stringify({
  fps: 30,
  resolution: {width: 1920, height: 1080},
  sceneMotion: "animated",
  enableIntro: false,
  transition: "fade",
  transitionDuration: 15,
  scenes: [
    {
      visualSpec: {
        schemaVersion: "v2",
        sceneId: "payment-request",
        visualIntent: "REQUEST_FLOW",
        intent: "REQUEST_FLOW",
        layout: "architecture-diagram",
        title: "Payment Request Flow",
        subtitle: "Mobile App → API Gateway",
        theme: "codeatcloud",
        semanticObjects: [
          {id: "mobile-app", type: "MOBILE_APP", label: "Mobile App"},
          {id: "payment-request", type: "REQUEST", label: "Payment Request"},
          {id: "api-gateway", type: "API_GATEWAY", label: "API Gateway"}
        ],
        semanticAnimations: [
          {type: "TRAVEL", object: "payment-request", from: "mobile-app", to: "api-gateway", at: 3.9, duration: 1.9},
          {type: "HIGHLIGHT", target: "api-gateway", at: 5.8, duration: 1.0}
        ],
        camera: {mode: "FOLLOW", target: "payment-request"},
        components: [
          {id: "mobile-app", type: "browser-node", label: "Mobile App"},
          {id: "api-gateway", type: "api-gateway", label: "API Gateway"}
        ],
        connections: [{from: "mobile-app", to: "api-gateway", style: "orthogonal"}]
      }
    }
  ]
});
const opts = { hostname: 'localhost', port: 3000, path: '/video', method: 'POST', headers: {'Content-Type':'application/json','Content-Length': Buffer.byteLength(payload)} };
console.log('Sending QUALITY V2 payload: REQUEST_FLOW payment-request');
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  let chunks=[]; res.on('data',c=>chunks.push(c)); res.on('end',()=>{
    const buf=Buffer.concat(chunks);
    console.log('BYTES',buf.length);
    if(res.statusCode!==200) console.log(buf.toString().slice(0,1200));
    else { fs.writeFileSync('baseline-v2-after.mp4', buf); console.log('wrote baseline-v2-after.mp4'); }
  });
});
req.on('error',e=>console.error(e));
req.write(payload); req.end();
