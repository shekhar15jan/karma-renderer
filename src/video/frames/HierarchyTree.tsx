/**
 * hierarchy-tree — parent-child structure from data.parent ids.
 *
 * PRAGMATIC FIRST PASS: renders as an indented nested list rather than a drawn
 * node-link tree with connecting lines (that wants the same real graph-layout
 * investment noted on state-machine). Structure and depth are still correct —
 * nesting is computed from data.parent, not from array order.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";
import type { SceneComponent } from "../../catalogue/assign";

function buildTree(nodes: SceneComponent[]): { node: SceneComponent; children: any[] }[] {
  const byId = new Map(nodes.map((n) => [n.id, { node: n, children: [] as any[] }]));
  const roots: { node: SceneComponent; children: any[] }[] = [];
  for (const n of nodes) {
    const wrapped = byId.get(n.id)!;
    const parentId = n.data?.parent;
    const parent = parentId ? byId.get(parentId) : undefined;
    if (parent) parent.children.push(wrapped);
    else roots.push(wrapped);
  }
  return roots;
}

export const HierarchyTree: FrameFC = ({ spec, slots, render }) => {
  const nodes = slots.nodes ?? [];
  const roots = buildTree(nodes);
  let cursor = 0;

  const renderNode = (entry: { node: SceneComponent; children: any[] }, depth: number): React.ReactNode => (
    <div key={entry.node.id ?? cursor} style={{ marginLeft: depth * 28 }} className="flex flex-col gap-2 py-1">
      <div className="flex items-center gap-2">
        {depth > 0 && <span style={{ color: "var(--scene-border)" }}>└</span>}
        {render(entry.node, cursor++)}
      </div>
      {entry.children.map((child: any) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-3xl mx-auto flex flex-col justify-center min-h-0 overflow-y-auto">
        {roots.map((r) => renderNode(r, 0))}
      </div>
    </div>
  );
};
