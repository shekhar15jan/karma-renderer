"use strict";
/** IconRegistry - inline SVG icons (auto-scalable, deterministic). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWN_ICONS = void 0;
exports.hasIcon = hasIcon;
exports.iconSvg = iconSvg;
const ICON_PATHS = {
    app: ["<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/>", "<rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"1\"/>"],
    box: ["<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/>", "<path d=\"M3 9h18\"/>"],
    database: ["<ellipse cx=\"12\" cy=\"5.5\" rx=\"7.5\" ry=\"3\"/>", "<path d=\"M4.5 5.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6\"/>", "<path d=\"M4.5 11.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6\"/>"],
    db: ["<ellipse cx=\"12\" cy=\"5.5\" rx=\"7.5\" ry=\"3\"/>", "<path d=\"M4.5 5.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6\"/>", "<path d=\"M4.5 11.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6\"/>"],
    cloud: ["<path d=\"M17.5 19a4.5 4.5 0 0 0 .42-8.97 6 6 0 0 0-11.7 1.64A4 4 0 0 0 7 19h10.5z\"/>"],
    server: ["<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"1.5\"/>", "<rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"1.5\"/>", "<circle cx=\"6.5\" cy=\"7\" r=\"0.6\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"17\" r=\"0.6\" fill=\"currentColor\"/>"],
    storage: ["<path d=\"M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "<path d=\"M3 10h18M3 14h18\"/>"],
    cpu: ["<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>", "<rect x=\"10\" y=\"10\" width=\"4\" height=\"4\"/>", "<path d=\"M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3\"/>"],
    memory: ["<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/>", "<path d=\"M7 6v12M11 6v12M15 6v12M19 6v12\"/>"],
    ram: ["<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/>", "<path d=\"M7 6v12M11 6v12M15 6v12M19 6v12\"/>"],
    download: ["<path d=\"M12 3v11M7 10l5 4 5-4\"/>", "<path d=\"M5 21h14\"/>"],
    upload: ["<path d=\"M12 21V10M7 14l5-4 5 4\"/>", "<path d=\"M5 4h14\"/>"],
    thread: ["<circle cx=\"12\" cy=\"5\" r=\"2.6\"/><circle cx=\"5\" cy=\"18\" r=\"2.6\"/><circle cx=\"19\" cy=\"18\" r=\"2.6\"/>", "<path d=\"M12 7.6v4M6.6 20v-2l3-3M17.4 20v-2l-3-3M12 11.6l-3 4M12 11.6l3 4\"/>"],
    process: ["<circle cx=\"12\" cy=\"12\" r=\"8\"/>", "<path d=\"M12 8v4l3 2\"/>"],
    gear: ["<circle cx=\"12\" cy=\"12\" r=\"3.2\"/>", "<path d=\"M12 2.8l1.4 2.1a6.5 6.5 0 0 1 3 0L17.8 2.8l3 3-1.6 1.9a6.5 6.5 0 0 1 0 3.6l1.6 1.9-3 3-1.4-2.1a6.5 6.5 0 0 1-3 0l-1.4 2.1-3-3 1.6-1.9a6.5 6.5 0 0 1 0-3.6L9 5.8z\"/>"],
    settings: ["<circle cx=\"12\" cy=\"12\" r=\"3.2\"/>", "<path d=\"M12 2.8l1.4 2.1a6.5 6.5 0 0 1 3 0L17.8 2.8l3 3-1.6 1.9a6.5 6.5 0 0 1 0 3.6l1.6 1.9-3 3-1.4-2.1a6.5 6.5 0 0 1-3 0l-1.4 2.1-3-3 1.6-1.9a6.5 6.5 0 0 1 0-3.6L9 5.8z\"/>"],
    lock: ["<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"9.5\" rx=\"2\"/>", "<path d=\"M8 10.5V7.5a4 4 0 0 1 8 0v3\"/>"],
    key: ["<circle cx=\"8\" cy=\"15\" r=\"4.5\"/>", "<path d=\"M12 11l7-7M16 8l2 2M14 6l2 2\"/>"],
    user: ["<circle cx=\"12\" cy=\"8\" r=\"4\"/>", "<path d=\"M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5\"/>"],
    users: ["<circle cx=\"9\" cy=\"8\" r=\"3.5\"/>", "<path d=\"M2.5 20c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5\"/>", "<path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.7c1.6.8 3 2.2 3 5.3\"/>"],
    check: ["<path d=\"M4 12.5l5.5 5.5L20 6.5\"/>"],
    cross: ["<path d=\"M6 6l12 12M18 6L6 18\"/>"],
    warning: ["<path d=\"M12 3L2.5 20h19z\"/>", "<path d=\"M12 9.5V14\"/><circle cx=\"12\" cy=\"16.8\" r=\"0.4\" fill=\"currentColor\"/>"],
    info: ["<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>", "<path d=\"M12 11v5\"/><circle cx=\"12\" cy=\"8\" r=\"0.5\" fill=\"currentColor\"/>"],
    question: ["<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>", "<path d=\"M9.5 9.2a2.6 2.6 0 1 1 3.8 2.3c-.8.5-1.3 1-1.3 2\"/><circle cx=\"12\" cy=\"16.5\" r=\"0.5\" fill=\"currentColor\"/>"],
    star: ["<path d=\"M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9L6.6 19.6l1-6L3.3 9.4l6-.9z\"/>"],
    heart: ["<path d=\"M12 20.5S4 15.5 4 9.9C4 7 6.3 5 8.8 5c1.5 0 2.9.8 3.2 2 .3-1.2 1.7-2 3.2-2C17.7 5 20 7 20 9.9c0 5.6-8 10.6-8 10.6z\"/>"],
    flag: ["<path d=\"M5 21V4\"/><path d=\"M5 4c3-1.5 5 1.5 8 0s5 1.5 8 0v10c-3 1.5-5-1.5-8 0s-5-1.5-8 0\"/>"],
    api: ["<path d=\"M8 8L4.5 12 8 16M16 8l3.5 4L16 16\"/>", "<path d=\"M13.5 5l-3 14\"/>"],
    queue: ["<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/>", "<path d=\"M8 9.5h8M8 14.5h5\"/>"],
    message: ["<path d=\"M21 12a8 8 0 0 1-8 8H4l2.2-2.6A8 8 0 1 1 21 12z\"/>"],
    mail: ["<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/>", "<path d=\"M3 7l9 6 9-6\"/>"],
    search: ["<circle cx=\"11\" cy=\"11\" r=\"6.5\"/>", "<path d=\"M20.5 20.5L16 16\"/>"],
    filter: ["<path d=\"M4 6h16M7 12h10M10 18h4\"/>"],
    folder: ["<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>"],
    file: ["<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/>", "<path d=\"M14 3v5h5M9 13h6M9 17h6\"/>"],
    code: ["<path d=\"M8 8L4 12l4 4M16 8l4 4-4 4M13 6l-2 12\"/>"],
    network: ["<circle cx=\"12\" cy=\"5\" r=\"2.5\"/><circle cx=\"5\" cy=\"18\" r=\"2.5\"/><circle cx=\"19\" cy=\"18\" r=\"2.5\"/>", "<path d=\"M12 7.5V11M5 20.5v-2.5M19 20.5v-2.5M12 11l-4.5 5.5M12 11l4.5 5.5\"/>"],
    globe: ["<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>", "<path d=\"M3.5 12h17M12 3.5c2.5 2.3 3.7 5.2 3.7 8.5s-1.2 6.2-3.7 8.5c-2.5-2.3-3.7-5.2-3.7-8.5s1.2-6.2 3.7-8.5z\"/>"],
    shield: ["<path d=\"M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z\"/>", "<path d=\"M8.5 12l2.5 2.5 4.5-4.5\"/>"],
    firewall: ["<path d=\"M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z\"/>", "<path d=\"M12 8v8M8 12h8\"/>"],
    cache: ["<rect x=\"3\" y=\"7\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"7\" width=\"7\" height=\"7\" rx=\"1.5\"/>", "<path d=\"M6.5 17.5v2M17.5 17.5v2\"/>"],
    monitor: ["<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/>", "<path d=\"M9 20h6M12 16v4\"/>"],
    chart: ["<path d=\"M5 20V9M12 20V4M19 20v-8\"/>"],
    clock: ["<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>", "<path d=\"M12 7v5l3.5 2\"/>"],
    cal: ["<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/>", "<path d=\"M3 9h18M8 3v4M16 3v4\"/>"],
    play: ["<path d=\"M7 4.5v15l12-7.5z\"/>"],
    stop: ["<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1.5\"/>"],
    refresh: ["<path d=\"M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4\"/>"],
    link: ["<path d=\"M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5\"/>", "<path d=\"M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5\"/>"],
    paperclip: ["<path d=\"M9.5 12.5l5-5a3 3 0 0 1 4.2 4.2l-6 6a5 5 0 0 1-7-7l6.5-6.5a6.5 6.5 0 0 1 9.2 9.2l-6.2 6.2\"/>"],
    terminal: ["<path d=\"M4 5l5 5-5 5\"/>", "<path d=\"M12 18h8\"/>"],
    book: ["<path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z\"/>", "<path d=\"M4 19a2 2 0 0 1 2-2h13\"/>"],
    target: ["<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>"],
};
function hasIcon(name) {
    if (!name)
        return false;
    return name in ICON_PATHS;
}
/** Returns inline SVG markup for an icon. All icons use currentColor. */
function iconSvg(name, size = 24, className = "icon") {
    const paths = ICON_PATHS[name ?? ""];
    if (!paths)
        return "";
    const stroke = `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${paths.join("")}</svg>`;
}
exports.KNOWN_ICONS = Object.keys(ICON_PATHS).sort();
