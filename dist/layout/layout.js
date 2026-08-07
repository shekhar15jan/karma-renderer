"use strict";
/** LayoutEngine - positions components so nothing overlaps.
 *  Graph layouts (flow/architecture/uml/mindmap) use ELK (layered / hierarchical).
 *  Content layouts (grid/columns/cards/bento/timeline/roadmap/dashboard) use CSS via React.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGraphLayout = isGraphLayout;
exports.isContentLayout = isContentLayout;
exports.estimateNodeSize = estimateNodeSize;
exports.layoutGraph = layoutGraph;
exports.contentColumns = contentColumns;
const elkjs_1 = __importDefault(require("elkjs"));
const GRAPH_LAYOUTS = ["flow", "flowchart", "architecture", "uml", "mindmap"];
function isGraphLayout(layout) {
    return GRAPH_LAYOUTS.includes(layout);
}
function isContentLayout(layout) {
    return !GRAPH_LAYOUTS.includes(layout);
}
const elk = new elkjs_1.default();
/** Sizing heuristics for un-sized nodes. */
function estimateNodeSize(c) {
    const icon = c.icon ? 40 : 0;
    const label = c.label ?? "";
    const chars = Math.max(label.length, c.sublabel ? c.sublabel.length : 0);
    const textW = Math.min(360, Math.max(120, chars * 9 + 40));
    const width = Math.max(textW, 130 + icon);
    const hasSub = c.sublabel ? 26 : 0;
    const lines = Math.max(1, Math.ceil(label.length / 16));
    const height = 62 + (lines - 1) * 20 + (hasSub > 0 ? hasSub : 0);
    return { width: Math.round(width), height: Math.round(height) };
}
function groupComponents(components, containers) {
    const groups = new Map();
    const ungrouped = [];
    const containersByIndex = new Map();
    containers.forEach((c, i) => containersByIndex.set(c.id, i));
    for (const c of components) {
        if (c.group && containersByIndex.has(c.group)) {
            const arr = groups.get(c.group) ?? [];
            arr.push(c);
            groups.set(c.group, arr);
        }
        else if (c.group && containersByIndex.has(c.group)) {
            // no-op guard
        }
        else {
            ungrouped.push(c);
        }
    }
    return { groups, ungrouped, containersByIndex };
}
/** ELK layered layout for graph diagrams. Returns absolute positions (1920x1080 frame). */
async function layoutGraph(components, connections, containers, frameW, frameH, direction = "DOWN", mode = "layered") {
    const byId = new Map(components.map((c) => [c.id, c]));
    const { groups, ungrouped, containersByIndex } = groupComponents(components, containers ?? []);
    const knownContainerIds = new Set(containers.map((c) => c.id));
    // ---- build ELK graph
    const elkChildren = [];
    const elkEdges = [];
    const componentIndex = new Map();
    // containers become parents
    for (const con of containers) {
        const kids = (groups.get(con.id) ?? []).map((c) => {
            componentIndex.set(c.id, components.indexOf(c));
            const s = estimateNodeSize(c);
            return {
                id: c.id,
                width: s.width,
                height: s.height,
                layoutOptions: { "elk.portConstraints": "FIXED_SIDE" },
            };
        });
        elkChildren.push({
            id: con.id,
            layoutOptions: {
                "elk.algorithm": "box",
                "elk.padding": "[top=28,left=20,right=20,bottom=20]",
                "elk.spacing.nodeNode": "24",
                "elk.box.packingMode": "NODE_AND_EDGE",
            },
            children: kids,
        });
    }
    // ungrouped nodes
    ungrouped.forEach((c) => {
        componentIndex.set(c.id, components.indexOf(c));
        const s = estimateNodeSize(c);
        elkChildren.push({ id: c.id, width: s.width, height: s.height });
    });
    // edges: skip edges whose target is a container (routing into container handled by ELK)
    for (const e of connections) {
        const srcKnown = byId.has(e.from) || knownContainerIds.has(e.from);
        const tgtKnown = byId.has(e.to) || knownContainerIds.has(e.to);
        if (!srcKnown || !tgtKnown)
            continue;
        elkEdges.push({
            id: `e_${e.from}_${e.to}_${Math.abs(e.from.hashCode2() + e.to.hashCode2())}`,
            sources: [e.from],
            targets: [e.to],
            layoutOptions: {
                "elk.edgeRouting": e.style === "straight" ? "UNDIRECTED" : "ORTHOGONAL",
                "elk.layered.edgeLabels.side": "UP",
            },
        });
    }
    const algorithm = mode === "layered" ? "layered" : mode === "box" ? "box" : "stress";
    const graph = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": algorithm,
            "elk.direction": direction,
            "elk.spacing.nodeNode": "48",
            "elk.spacing.componentComponent": "60",
            "elk.layered.spacing.nodeNodeBetweenLayers": "70",
            "elk.layered.spacing.edgeNodeBetweenLayers": "40",
            "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
            "elk.edgeRouting": "ORTHOGONAL",
            "elk.padding": "[top=140,left=70,right=70,bottom=80]",
        },
        children: elkChildren,
        edges: elkEdges,
    };
    let laid;
    try {
        laid = await elk.layout(graph);
    }
    catch (e) {
        // ELK can fail on weird graphs; fall back to a simple grid
        return layoutGridFallback(components, connections, containers, frameW, frameH);
    }
    // ---- extract positions
    const nodes = [];
    const containersOut = [];
    const placedById = new Map();
    const walk = (node, offsetX, offsetY) => {
        const x = offsetX + (node.x ?? 0);
        const y = offsetY + (node.y ?? 0);
        const w = node.width ?? 0;
        const h = node.height ?? 0;
        if (node.children && node.children.length > 0) {
            if (knownContainerIds.has(node.id)) {
                containersOut.push({
                    id: node.id,
                    x,
                    y,
                    width: w,
                    height: h,
                    children: (node.children ?? []).map((c) => c.id).filter((id) => byId.has(id)),
                    index: containersByIndex.get(node.id) ?? 0,
                });
            }
            for (const kid of node.children ?? [])
                walk(kid, x, y);
        }
        else if (byId.has(node.id)) {
            const idx = componentIndex.get(node.id) ?? 0;
            const n = { id: node.id, x, y, width: w, height: h, index: idx };
            nodes.push(n);
            placedById.set(node.id, n);
        }
    };
    for (const child of laid.children ?? [])
        walk(child, 0, 0);
    // ---- edges with waypoints
    const edges = [];
    for (const e of laid.edges ?? []) {
        const pts = [];
        for (const section of e.sections ?? []) {
            if (section.startPoint)
                pts.push(section.startPoint);
            for (const bp of section.bendPoints ?? [])
                pts.push(bp);
            if (section.endPoint)
                pts.push(section.endPoint);
        }
        edges.push({ from: e.sources?.[0] ?? "", to: e.targets?.[0] ?? "", points: pts });
    }
    // ---- compute bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of [...nodes, ...containersOut]) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
    }
    if (!isFinite(minX)) {
        minX = 0;
        minY = 0;
        maxX = frameW;
        maxY = frameH;
    }
    // If the graph is smaller than the frame, center it.
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    let offsetX = 0, offsetY = 0;
    const extraPadding = { top: 150, left: 80, right: 80, bottom: 120 };
    const availW = frameW - extraPadding.left - extraPadding.right;
    const availH = frameH - extraPadding.top - extraPadding.bottom;
    if (contentW < availW)
        offsetX = extraPadding.left + (availW - contentW) / 2 - minX;
    else
        offsetX = extraPadding.left - minX + 10;
    if (contentH < availH)
        offsetY = extraPadding.top + (availH - contentH) / 2 - minY;
    else
        offsetY = extraPadding.top - minY + 10;
    for (const n of nodes) {
        n.x += offsetX;
        n.y += offsetY;
    }
    for (const c of containersOut) {
        c.x += offsetX;
        c.y += offsetY;
    }
    for (const e of edges) {
        for (const p of e.points) {
            p.x += offsetX;
            p.y += offsetY;
        }
    }
    return { nodes, edges, containers: containersOut, width: frameW, height: frameH, extraPadding };
}
function layoutGridFallback(components, connections, containers, frameW, frameH) {
    const nodes = [];
    const byId = new Map(components.map((c) => [c.id, c]));
    const n = components.length;
    const cols = n <= 3 ? n : 3;
    const rows = Math.ceil(n / cols);
    const marginLeft = 120, marginTop = 180;
    const usableW = frameW - 240;
    const usableH = frameH - 300;
    const gapX = 40, gapY = 40;
    const boxW = Math.min(340, (usableW - (cols - 1) * gapX) / cols);
    const boxH = Math.min(120, (usableH - (rows - 1) * gapY) / rows);
    const totalW = cols * boxW + (cols - 1) * gapX;
    const totalH = rows * boxH + (rows - 1) * gapY;
    const startX = marginLeft + (usableW - totalW) / 2;
    const startY = marginTop + (usableH - totalH) / 2;
    components.forEach((c, i) => {
        const row = Math.floor(i / cols), col = i % cols;
        nodes.push({
            id: c.id, x: startX + col * (boxW + gapX), y: startY + row * (boxH + gapY),
            width: boxW, height: boxH, index: i,
        });
    });
    const edges = connections
        .filter((e) => byId.has(e.from) && byId.has(e.to))
        .map((e) => {
        const f = nodes.find((x) => x.id === e.from);
        const t = nodes.find((x) => x.id === e.to);
        return {
            from: e.from, to: e.to,
            points: [
                { x: f.x + f.width / 2, y: f.y + f.height / 2 },
                { x: t.x + t.width / 2, y: t.y + t.height / 2 },
            ],
        };
    });
    const containersOut = containers.map((con, idx) => {
        const kids = nodes.filter((x) => con.children.includes(x.id));
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const k of kids) {
            minX = Math.min(minX, k.x - 20);
            minY = Math.min(minY, k.y - 30);
            maxX = Math.max(maxX, k.x + k.width + 20);
            maxY = Math.max(maxY, k.y + k.height + 20);
        }
        if (!isFinite(minX)) {
            minX = 40;
            minY = 180;
            maxX = 400;
            maxY = 300;
        }
        return { id: con.id, x: minX, y: minY, width: maxX - minX, height: maxY - minY, children: con.children, index: idx };
    });
    return { nodes, edges, containers: containersOut, width: frameW, height: frameH, extraPadding: { top: 150, left: 80, right: 80, bottom: 120 } };
}
String.prototype.hashCode2 = function () {
    let h = 0;
    for (let i = 0; i < this.length; i++) {
        h = (Math.imul(31, h) + this.charCodeAt(i)) | 0;
    }
    return h;
};
/** Default columns for a content layout based on type. */
function contentColumns(layout) {
    switch (layout) {
        case "cards": return 3;
        case "bento": return 4;
        case "columns": return 3;
        case "dashboard": return 3;
        case "grid": return 4;
        case "timeline":
        case "roadmap":
        case "learning-path":
        case "sprint":
        case "poster":
        case "infographic":
        default:
            return 1;
    }
}
