const http = require('http');
const payload = JSON.stringify({
  fps: 30,
  resolution: {width: 1920, height: 1080},
  sceneMotion: "static",
  enableIntro: false,
  transition: "fade",
  transitionDuration: 15,
  scenes: [
    { visualSpec: { layout: "title-slide", title: "Payment Saga", subtitle: "Golden Test Hook", intent: "HOOK", type: "HookScene" } },
    { visualSpec: { layout: "architecture-diagram", title: "Request Flow", intent: "ARCHITECTURE", semanticObjects: [{id:"gateway",type:"API_GATEWAY",label:"API Gateway"},{id:"payment",type:"SERVICE",label:"Payment"}], semanticAnimations: [{type:"travel",from:"gateway",to:"payment",at:1}], camera: {mode:"FOLLOW", target:"payment"}, components: [{id:"gateway",type:"api-gateway",label:"API Gateway"},{id:"payment",type:"microservice-node",label:"Payment"}], connections: [{from:"gateway",to:"payment",style:"orthogonal"}] } },
    { visualSpec: { layout: "architecture-diagram", title: "Kafka Event", intent: "SIMULATION", components: [{id:"producer",type:"microservice-node",label:"Producer"},{id:"kafka",type:"message-queue",label:"Kafka"},{id:"consumer",type:"microservice-node",label:"Consumer"}], connections: [{from:"producer",to:"kafka"},{from:"kafka",to:"consumer"}] } }
  ]
});
const opts = { hostname: 'localhost', port: 3000, path: '/video', method: 'POST', headers: {'Content-Type':'application/json','Content-Length': Buffer.byteLength(payload)} };
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode, res.headers['content-type']);
  let chunks=[]; res.on('data',c=>chunks.push(c)); res.on('end',()=>{ const buf=Buffer.concat(chunks); console.log('BYTES',buf.length); if(res.statusCode!==200) console.log(buf.toString().slice(0,800)); else require('fs').writeFileSync('/tmp/golden-test.mp4',buf); });
});
req.on('error',e=>console.error(e));
req.write(payload); req.end();
