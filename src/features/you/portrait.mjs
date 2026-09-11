import { portraitEvidence } from './portrait-evidence.mjs';
// Shape + colour are stable across portraits, the trait key and detail view.
export const traitLanguage = {
  Planning: {
    shape: 'arch',
    color: '#4D8590',
    light: '#BBDADC',
    copy: 'An arch gives structure: a clear plan to build on.',
  },
  Rhythm: {
    shape: 'wave',
    color: '#C6854E',
    light: '#F1D5AD',
    copy: 'A repeating wave represents a regular routine.',
  },
  Patience: {
    shape: 'rings',
    color: '#8E7FA6',
    light: '#D9CFE3',
    copy: 'Concentric rings represent a longer view.',
  },
  Spontaneity: {
    shape: 'bloom',
    color: '#D68269',
    light: '#F3C6AA',
    copy: 'An open bloom represents room for the unexpected.',
  },
  Generosity: {
    shape: 'embrace',
    color: '#B87989',
    light: '#E9C7CF',
    copy: 'Two joined forms represent making room for others.',
  },
  Focus: {
    shape: 'lens',
    color: '#C6A14C',
    light: '#EDDAA2',
    copy: 'A lens gathers around one centre: a clear goal.',
  },
};
export function portraitModel(p, member = 'self') {
  const shared = p.l2.personality.members?.find((m) => m.memberId === member);
  const self = !shared;
  const personality = shared?.personality || p.l2.personality;
  const traits = (personality.traits || []).map(([t, n]) => [
    t,
    Math.max(0, Math.min(5, Number(n) || 0)),
  ]);
  const ranked = [...traits].sort((a, b) => b[1] - a[1]);
  const confirmed = self
    ? new Set(
        p.l2.beliefs.filter((b) => ['confirmed', 'corrected'].includes(b.status)).map((b) => b.id),
      ).size + Number(!!p.ui.confirmed)
    : 0;
  const named = !!personality.name;
  const evidence = portraitEvidence[self ? p.l1.customer.id : member] || {
    depth: 0,
    description: 'Only the information shared in this profile.',
  };
  // Three distinct bands: first impression, developing, richly understood. Feedback adds finer detail.
  const layers = named ? 2 + evidence.depth * 4 + Math.min(confirmed, 4) : 1;
  const fidelity = !named
    ? 'outline'
    : layers >= 12
      ? 'rich'
      : layers >= 5
        ? 'developing'
        : 'early';
  const palette = ranked.map(([t]) => traitLanguage[t]?.color || '#809495');
  const household = member === 'household' && !!shared;
  const participants = household
    ? [
        'self',
        ...(p.l2.personality.members || [])
          .filter((m) => m.memberId !== 'household')
          .map((m) => m.memberId),
      ].map((id) => portraitModel(p, id))
    : [];
  return {
    self,
    member: self ? 'self' : member,
    personality,
    traits,
    ranked,
    dominant: ranked[0]?.[0] || 'Planning',
    palette: palette.length ? palette : ['#BDC7C5'],
    layers,
    fidelity,
    named,
    confirmed,
    evidence,
    stage: !named
      ? 'A first outline'
      : fidelity === 'rich'
        ? 'A richer understanding'
        : fidelity === 'developing'
          ? 'Taking shape with you'
          : 'A first impression',
    source: personality.provenance || personality.src || '',
    household,
    participants,
    householdPalettes: participants.map((m) => m.palette),
  };
}
export const traitExpression = (t) =>
  traitLanguage[t]?.copy || 'One part of your approach to money.';
const flower = () => {
  const pts = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2;
    const r = 66 + 12 * Math.cos(6 * a);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  return 'M' + pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L') + 'Z';
};
const paths = {
  arch: 'M-74 78V-10A74 74 0 0 1 74-10V78Z',
  wave: 'M-80-53C-27-92 27-14 80-53V-13C27 26-27-52-80-13ZM-80 13C-27-26 27 52 80 13V53C27 92-27 14-80 53Z',
  rings: 'M80 0A80 80 0 1 1-80 0A80 80 0 1 1 80 0ZM40 0A40 40 0 1 0-40 0A40 40 0 1 0 40 0Z',
  bloom: flower(),
  embrace: 'M0-47C-100-115-116 40 0 79C116 40 100-115 0-47Z',
  lens: 'M-88 0Q0-140 88 0Q0 140-88 0Z',
};
function shapeMarkup(trait, detail = 0, paint = null, outline = false, clip = '') {
  const token = traitLanguage[trait] || traitLanguage.Planning;
  const path = paths[token.shape],
    color = paint || token.color;
  const base = `<path d="${path}" fill="${outline ? 'none' : color}" fill-rule="evenodd" stroke="${color}" stroke-width="${outline ? 1.5 : 0}"/>`;
  if (outline || !detail) return base;
  const contours = Array.from({ length: detail }, (_, i) => {
    const scale = (0.9 - i * 0.065).toFixed(3);
    return `<path d="${path}" transform="scale(${scale})" fill="none" stroke="${token.light}" stroke-opacity="${i % 2 ? 0.55 : 0.85}" stroke-width="${i % 3 === 0 ? 1.7 : 0.8}"/>`;
  }).join('');
  return (
    base + (clip ? `<g clip-path="url(#${clip}-clip-${token.shape})">${contours}</g>` : contours)
  );
}
export function traitGlyph(trait) {
  return `<svg class="portrait-glyph" viewBox="-95 -95 190 190" aria-hidden="true" focusable="false">${shapeMarkup(trait)}</svg>`;
}
function composition(m, prefix = '') {
  if (!m.named)
    return `<g class="portrait-form"><g class="portrait-drift" style="--drift-period:28s;--drift-phase:-9s"><circle cx="210" cy="162" r="89" fill="none" stroke="#9AAEAD" stroke-width="1.2"/><path d="M145 192V151a65 65 0 0 1 130 0v41" fill="none" stroke="#B7C9C6" stroke-width="16" stroke-linecap="round"/><circle cx="281" cy="219" r="25" fill="#D0DCD7"/></g></g>`;
  const early = m.fidelity === 'early';
  const traits = m.ranked.slice(0, 3);
  // Strength changes scale. Shape positions preserve a stable identity when detail increases.
  const positions = [
    [172, 159, 1.23, -8],
    [271, 207, 0.84, 12],
    [276, 94, 0.65, -12],
  ];
  let result = traits
    .map(([trait, value], i) => {
      const [x, y, scale, rotation] = positions[i];
      const detail = early ? (i === 0 ? 1 : 0) : Math.min(10, Math.max(2, m.layers - 2 - i));
      return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${(scale * (0.75 + value / 20)).toFixed(2)})" data-shape="${traitLanguage[trait]?.shape || 'arch'}"><g class="portrait-form" style="--form-delay:${i * 100}ms"><g class="portrait-drift" style="--drift-period:${24 + i * 4}s;--drift-phase:${-i * 8}s">${shapeMarkup(trait, detail, null, early && i > 0, prefix)}</g></g></g>`;
    })
    .join('');
  // Evidence expands into related echoes: all use the same trait grammar, never random ornaments.
  if (!early)
    result += Array.from({ length: Math.max(1, m.layers - 4) }, (_, i) => {
      const a = ((i * 137.5 + 22) * Math.PI) / 180;
      const x = 210 + Math.cos(a) * 146,
        y = 166 + Math.sin(a) * 116;
      const t = traits[i % traits.length][0];
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${i * 18}) scale(${m.fidelity === 'rich' ? 0.17 : 0.13})" data-evidence-echo="${prefix + i}"><g class="portrait-form" style="--form-delay:${Math.min(600, i * 45)}ms"><g class="portrait-drift" style="--drift-period:${28 + (i % 4) * 4}s;--drift-phase:${-i * 7}s">${shapeMarkup(t, m.fidelity === 'rich' ? 3 : 0, null, false, prefix)}</g></g></g>`;
    }).join('');
  return result;
}
export function portraitArt(m, instance = 'page') {
  const id = `portrait-${instance}-${m.member}`;
  // Compose around each portrait’s visual centre, rather than its SVG origin.
  // Two people fill a shared horizontal space; three form a balanced cluster.
  const layout =
    m.participants.length === 2
      ? [
          [140, 172, 0.72],
          [278, 184, 0.72],
        ]
      : [
          [140, 128, 0.57],
          [274, 140, 0.57],
          [212, 207, 0.57],
        ];
  const art = m.household
    ? m.participants
        .map((p, i) => {
          const [x, y, scale] = layout[i % layout.length];
          return `<g data-portrait-person="${p.member === 'self' ? 'self' : p.member}" transform="translate(${x} ${y}) scale(${scale}) translate(-210 -166)">${composition(p, id)}</g>`;
        })
        .join('')
    : composition(m, id);
  return `<svg class="portrait-art" viewBox="0 0 420 340" aria-hidden="true" focusable="false" data-layers="${m.layers}" data-fidelity="${m.household ? 'shared' : m.fidelity}"><defs>${Object.entries(
    paths,
  )
    .map(
      ([shape, d]) =>
        `<clipPath id="${id}-clip-${shape}"><path d="${d}" clip-rule="evenodd"/></clipPath>`,
    )
    .join(
      '',
    )}<radialGradient id="${id}-ground"><stop stop-color="${m.palette[0]}" stop-opacity=".13"/><stop offset="1" stop-color="${m.palette[0]}" stop-opacity="0"/></radialGradient></defs><ellipse cx="210" cy="174" rx="195" ry="162" fill="url(#${id}-ground)"/>${art}</svg>`;
}
