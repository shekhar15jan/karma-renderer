/** Shared scene CSS - used by both the Puppeteer document builder and the Remotion composition. */

export const SCENE_CSS = `
:root {
  --bg: var(--scene-bg, #ffffff);
  --surface: var(--scene-surface, #f5f7fa);
  --surface2: var(--scene-surface2, #eef1f6);
  --text: var(--scene-text, #33363d);
  --muted: var(--scene-muted, #6b7280);
  --primary: var(--scene-primary, #4f6ef7);
  --secondary: var(--scene-secondary, #10b981);
  --accent: var(--scene-accent, #f59e0b);
  --border: var(--scene-border, #c9d3e0);
  --radius: var(--scene-radius, 12px);
  --spacing: var(--scene-spacing, 24px);
  --font: var(--scene-font, 'Segoe UI','Inter','Helvetica Neue',Arial,sans-serif);
  --heading: var(--scene-heading, 'Inter','Segoe UI','Poppins','Helvetica Neue',Arial,sans-serif);
  --code: var(--scene-code, 'JetBrains Mono','Cascadia Code','Consolas','Courier New',monospace);
}
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:100%; height:100%; overflow:hidden; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}
.page { position:relative; width:100%; height:100%; display:flex; flex-direction:column; padding:var(--spacing); }
.title-band { padding: 14px var(--spacing) 6px; text-align:center; }
.title-main { font-size:40px; font-weight:900; color:var(--heading); font-family:var(--heading); text-transform:uppercase; letter-spacing:0.5px; }
.title-sub { font-size:22px; color:var(--muted); margin-top:6px; font-weight:500; }
.scene-wrap { flex:1; position:relative; min-height:0; }
.scene-svg { position:absolute; inset:0; }

/* section label (uppercase colored kicker above a card/banner) */
.section-label {
  font-size:15px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;
}

/* reference dark hero band (matches 0.Intro.html) */
.hero-band {
  position:relative; overflow:hidden; border-bottom:2px solid #1e293b;
  background:#091325;
  background-image:
    radial-gradient(circle at right center, rgba(56,189,248,0.16) 0%, transparent 42%),
    radial-gradient(circle at left center, rgba(243,75,34,0.12) 0%, transparent 42%);
  padding:22px var(--spacing) 18px; text-align:center;
}
.hero-band .hero-inner { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; }
.hero-band .hero-kicker { color:#fff; font-size:19px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; }
.hero-band .hero-main { color:var(--accent); font-size:62px; font-weight:900; line-height:1; letter-spacing:-0.5px; margin:10px 0 8px; }
.hero-band .hero-sub { color:#fff; font-size:30px; font-weight:700; letter-spacing:0.04em; }
.hero-band .hero-divider { width:150%; height:2px; background:var(--accent); margin-top:12px; }
.hero-band .hero-logo { color:#f34b22; font-size:30px; font-weight:900; margin-bottom:6px; }
.bottom-band {
  display:flex; gap:var(--spacing); align-items:stretch;
  padding: var(--spacing) var(--spacing) 10px; min-height:132px;
}
.bottom-instr { flex:1; min-width:0; }
.bottom-code { flex:1; min-width:0; }

/* content layouts */
.content-scene { padding: 8px var(--spacing) 4px; height:100%; overflow:hidden; }
.content-grid { display:grid; gap:var(--spacing); height:100%; }
.content-timeline { display:flex; }
.card {
  padding:18px 20px; border-radius:var(--radius); display:flex; flex-direction:column; gap:10px;
  min-height:0; overflow:hidden;
}
.card .info-head,.card .bullet-head,.card .warn-head,.card .summary-head {
  display:flex; align-items:center; gap:10px; font-weight:700; font-size:19px;
}
.info-body,.summary-body,.warn-body { color:var(--text); font-size:16px; opacity:0.92; }
.bullet-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
.bullet-list li { font-size:16px; display:flex; gap:8px; align-items:baseline; }
.bullet-list li::before { content:"•"; color:var(--primary); font-weight:800; }
.bullet-list .sub { display:block; font-size:13px; color:var(--muted); margin-left:18px; }
.stat-value { font-size:52px; font-weight:800; line-height:1.05; }
.stat-unit { font-size:22px; font-weight:600; color:var(--muted); }
.stat-label { font-size:18px; color:var(--muted); }
.quote-text { font-size:22px; font-style:italic; line-height:1.35; }
.quote-author { font-size:15px; color:var(--muted); margin-top:8px; text-align:right; }
.title-card-title { font-size:30px; font-weight:800; font-family:var(--heading); }
.title-card-sub { font-size:18px; color:var(--muted); }
.comparison-head { font-weight:700; font-size:18px; }
.comparison-table { width:100%; border-collapse:collapse; font-size:15px; }
.comparison-table td { border-bottom:1px solid var(--border); padding:6px 8px; }
.comparison-table .cmp-key { font-weight:600; color:var(--muted); width:120px; }

.container { padding:14px 16px; position:relative; display:flex; flex-direction:column; gap:10px; min-height:0; }
.container-label { font-weight:700; font-size:16px; }
.container-items { display:flex; flex-wrap:wrap; gap:8px; overflow:auto; }
.chip {
  display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px;
  background:var(--surface); border:1.5px solid var(--border); font-size:14px; font-weight:600;
}
.chip-value { color:var(--muted); font-weight:600; }

/* reference banner (yellow takeaway / question highlight) */
.banner {
  display:flex; gap:16px; align-items:flex-start; padding:18px 22px;
}
.banner-icon {
  flex:none; width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-top:2px;
}
.banner-body { display:flex; flex-direction:column; gap:6px; min-width:0; }
.banner-label { font-weight:800; font-size:22px; }
.banner-text { font-size:17px; line-height:1.4; }
.banner-list { list-style:none; display:flex; flex-direction:column; gap:6px; }
.banner-list li { font-size:16px; display:flex; gap:8px; align-items:baseline; }
.banner-list li::before { content:"•"; font-weight:800; }
.banner-list .sub { display:block; font-size:13px; color:var(--muted); margin-left:16px; }

/* reference pill-header card (colored border + top badge) */
.pill-card { position:relative; display:flex; flex-direction:column; padding:34px 20px 18px; overflow:hidden; }
.pill-badge {
  position:absolute; top:14px; left:20px; display:inline-flex; align-items:center; gap:8px;
  color:#fff; font-weight:700; font-size:16px; padding:7px 16px; border-radius:999px;
}
.pill-num { width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; }
.pill-body { display:flex; flex-direction:column; gap:8px; }
.pill-sub { font-weight:700; font-size:19px; }
.pill-text { font-size:16px; line-height:1.45; color:var(--text); opacity:0.92; }

/* reference numbered pillar box (review grid) */
.pillar { display:flex; flex-direction:column; overflow:hidden; }
.pillar-head { display:flex; align-items:center; gap:10px; color:#fff; padding:10px 15px; }
.num-circle { width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex:none; }
.pillar-title { font-weight:800; font-size:16px; }
.pillar-content { padding:14px 16px; display:flex; flex-direction:column; gap:8px; }

/* reference table with dark header row */
.table-dark .data-table th { background:var(--dt-head); color:#fff; border-bottom:2px solid rgba(255,255,255,0.15); }
.table-dark { background:var(--surface); border:1px solid var(--border); }

.timeline { display:flex; flex-direction:column; gap:10px; }
.tl-title { font-size:24px; font-weight:800; font-family:var(--heading); }
.tl-track { display:flex; flex-direction:column; gap:16px; }
.tl-horizontal .tl-track { flex-direction:row; gap:12px; align-items:flex-start; }
.tl-horizontal .tl-track { position:relative; }
.tl-horizontal .tl-track::before { content:""; position:absolute; top:15px; left:0; right:0; height:3px; background:var(--tl-line); border-radius:2px; }
.tl-item { display:flex; gap:12px; align-items:flex-start; position:relative; }
.tl-horizontal .tl-item { flex-direction:column; align-items:center; text-align:center; flex:1; min-width:0; }
.tl-node { width:32px; height:32px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; box-shadow:0 2px 6px rgba(0,0,0,0.2); flex:none; }
.tl-content { display:flex; flex-direction:column; gap:2px; padding-top:4px; }
.tl-label { font-weight:700; font-size:16px; }
.tl-sub { font-size:13px; color:var(--muted); }

.chart-wrap { display:flex; align-items:center; justify-content:center; height:100%; }
.chart-wrap svg { max-width:100%; max-height:100%; }

.table-wrap { display:flex; flex-direction:column; padding:14px 16px; background:var(--surface); border:1px solid var(--border); overflow:auto; }
.table-title { font-weight:800; font-size:20px; font-family:var(--heading); margin-bottom:10px; }
.data-table { width:100%; border-collapse:collapse; font-size:15px; }
.data-table th { background:var(--surface2); text-align:left; padding:8px 10px; font-weight:700; border-bottom:2px solid var(--border); }
.data-table td { padding:8px 10px; border-bottom:1px solid var(--border); }
.data-table tr:hover td { background:var(--surface); }

.code-panel { display:flex; flex-direction:column; height:100%; min-height:110px; overflow:hidden; }
.code-head { display:flex; justify-content:space-between; align-items:center; padding:8px 14px; background:rgba(255,255,255,0.08); }
.code-lang { font-family:var(--code); font-size:12px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; }
.code-dots span { display:inline-block; width:9px; height:9px; border-radius:50%; background:#f87171; margin-left:4px; }
.code-dots span:nth-child(2){ background:#fbbf24; } .code-dots span:nth-child(3){ background:#34d399; }
.code-panel pre { flex:1; padding:12px 14px; overflow:hidden; font-family:var(--code); font-size:15px; line-height:1.45; white-space:pre-wrap; word-break:break-word; }

.instructions { list-style:none; display:flex; flex-direction:column; gap:8px; padding:8px 4px; }
.instructions li { display:flex; align-items:center; gap:12px; font-size:17px; }
.instructions .num { width:28px; height:28px; border-radius:50%; color:#fff; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; flex:none; }
.instructions .instr { line-height:1.35; }

.shape-icon { color:var(--text); opacity:0.85; }

/* presentation layout: split screen (visual core left, content blocks right) */
.presentation-scene {
  position:absolute; inset:0; display:flex; flex-direction:row;
  gap:var(--spacing); padding: var(--spacing);
}
.pres-visual {
  flex:0 0 50%; min-width:0; display:flex; align-items:center; justify-content:center;
  position:relative; min-height:0;
}
.pres-visual .content-scene { width:100%; height:100%; }
.pres-visual-empty {
  display:flex; align-items:center; justify-content:center; width:100%; height:100%;
}
.pres-empty-mark {
  font-size:96px; line-height:1; opacity:0.35; border:4px solid currentColor; border-radius:50%;
  width:140px; height:140px; display:flex; align-items:center; justify-content:center;
}
.pres-blocks {
  flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--spacing);
  justify-content:center; overflow:hidden;
}
.pres-block { padding:22px 26px; min-height:0; }
.pres-heading { font-size:26px; font-weight:800; margin-bottom:10px; }
.pres-text { font-size:18px; line-height:1.5; }

/* branding */
.brand-logo { position:absolute; z-index:5; }
.brand-logo svg, .brand-logo img { display:block; }
.brand-footer { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:13px; color:var(--muted); z-index:5; }
.brand-header { position:absolute; top:8px; left:50%; transform:translateX(-50%); font-size:13px; color:var(--muted); z-index:5; }
.brand-watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:120px; font-weight:900; color:rgba(0,0,0,0.04); letter-spacing:4px; z-index:0; pointer-events:none; }
`;
