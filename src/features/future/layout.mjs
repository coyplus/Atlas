// One monetary scale across every circle, held constant throughout Time Travel.
export function balanceScale(goals) {
  return 92 / Math.sqrt(Math.max(1, ...goals.map((g) => Math.max(g.balance || 0, g.target || 0))));
}
export function packBalances(goals, values, scale, previous = []) {
  const nodes = goals.map((g, i) => {
    const old = previous.find((n) => n.id === g.id);
    const valueRadius = g.visualRadius || Math.sqrt(Math.max(0, values[g.id] || 0)) * scale;
    const targetRadius = g.visualRadius ? 0 : Math.sqrt(Math.max(0, g.target || 0)) * scale;
    const a = i * 2.399963;
    return {
      id: g.id,
      valueRadius,
      targetRadius,
      radius: Math.max(valueRadius, targetRadius, 12),
      x: old?.x ?? Math.cos(a) * 40 * Math.sqrt(i),
      y: old?.y ?? Math.sin(a) * 40 * Math.sqrt(i),
    };
  });
  for (let pass = 0; pass < 360; pass++) {
    for (const n of nodes) {
      n.x *= 0.992;
      n.y *= 0.992;
    }
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j];
        let dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy);
        if (d < 0.001) {
          dx = 1;
          dy = 0.5;
          d = Math.hypot(dx, dy);
        }
        const gap = a.radius + b.radius + 14;
        if (d < gap) {
          const push = (gap - d) / 2;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
  }
  // Final collision-only relaxation guarantees the visible target rings have breathing room.
  for (let pass = 0; pass < 80; pass++)
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j],
          dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy) || 1,
          gap = a.radius + b.radius + 14;
        if (d < gap) {
          const push = (gap - d) / 2 + 0.001;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
  const bounds = () => ({
    left: Math.min(...nodes.map((n) => n.x - n.radius)),
    right: Math.max(...nodes.map((n) => n.x + n.radius)),
    top: Math.min(...nodes.map((n) => n.y - n.radius)),
    bottom: Math.max(...nodes.map((n) => n.y + n.radius)),
  });
  if (nodes.length) {
    const b = bounds(),
      cx = (b.left + b.right) / 2,
      cy = (b.top + b.bottom) / 2;
    nodes.forEach((n) => {
      n.x -= cx;
      n.y -= cy;
    });
  }
  return nodes;
}

// At overview scale the visible money circles can be smaller than a tap target.
// Separate the screen-space hit areas without changing any monetary diameter.
export function separateHitAreas(nodes, scale) {
  const points = nodes.map((n) => ({
    ...n,
    x: n.x * scale,
    y: n.y * scale,
    hitRadius: Math.max(14, n.radius * scale),
  }));
  for (let pass = 0; pass < 80; pass++) {
    let moved = false;
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i],
          b = points[j];
        let dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy);
        if (d < 0.001) {
          dx = 1;
          dy = 0.5;
          d = Math.hypot(dx, dy);
        }
        const gap = a.hitRadius + b.hitRadius + 4;
        if (d < gap) {
          const push = (gap - d) / 2 + 0.001;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
          moved = true;
        }
      }
    if (!moved) break;
  }
  return points;
}
