// Small, self-contained vector collectibles: no image downloads or external dependencies.
const palettes = {
  amber: ['#f2dba6', '#c9a24c', '#60491d'],
  green: ['#d0dfac', '#84a06b', '#344b36'],
  mint: ['#c4e1d5', '#78b29f', '#2c554e'],
  blue: ['#c6d8e8', '#809dbf', '#344d70'],
  lilac: ['#ddd0ed', '#a390bf', '#53426d'],
  coral: ['#edc3b0', '#c78c71', '#713f35'],
  teal: ['#c0d9da', '#729fa3', '#32585e'],
  rose: ['#e5c8d3', '#bc8d9f', '#684352'],
};
const shapes = {
  scallop:
    'M60 8Q72 2 79 15Q94 12 96 28Q111 31 107 47Q119 60 107 73Q111 89 96 92Q94 108 79 105Q72 118 60 112Q48 118 41 105Q26 108 24 92Q9 89 13 73Q1 60 13 47Q9 31 24 28Q26 12 41 15Q48 2 60 8Z',
  shield: 'M60 7L105 24V61Q105 91 60 115Q15 91 15 61V24Z',
  arch: 'M14 105V54A46 46 0 0 1 106 54V105Q60 118 14 105Z',
  hex: 'M60 5L106 32V88L60 115L14 88V32Z',
};
const motifs = {
  sun: '<circle cx="60" cy="60" r="18"/><path d="M60 27V33M60 87V93M27 60H33M87 60H93M37 37L41 41M79 79L83 83M37 83L41 79M79 41L83 37"/><path d="M52 61L58 67L69 54"/>',
  stairs:
    '<path d="M32 84H88M34 83V70H48V57H62V44H76V31H88M45 38L53 30M42 30H53V41"/><path d="M81 81V62M73 71H89"/>',
  sprout:
    '<path d="M60 90V59M60 64Q29 65 31 36Q60 36 60 64ZM60 54Q62 28 89 32Q86 58 60 59M41 91H80"/>',
  flags:
    '<path d="M32 88V44L51 37V59L32 65M60 88V34L79 27V49L60 55M79 88V65L93 60V78L79 83M25 90H95"/>',
  umbrella:
    '<path d="M28 56Q60 9 92 56H28ZM60 56V83Q60 99 75 88M60 27V22M42 56Q43 37 60 27Q77 37 78 56M33 72L29 80M87 72L83 80"/>',
  mountain:
    '<path d="M25 88L53 39L66 59L78 42L101 88ZM43 57L53 62L59 51M53 39V23L75 28L53 34M78 42L85 57L76 61L69 54"/>',
  jar: '<path d="M41 28H79V41Q89 45 89 58V89Q60 101 31 89V58Q31 45 41 41ZM41 35H79M34 64H86"/><circle cx="60" cy="78" r="10"/><path d="M52 53H61M68 52H74"/>',
  hourglass:
    '<path d="M39 29H81M39 91H81M44 30Q43 49 60 60Q77 70 76 90M76 30Q77 49 60 60Q43 70 44 90M46 44H74M47 86L60 75L73 86Z"/>',
  bowl: '<path d="M27 62H93Q90 87 60 90Q30 87 27 62ZM44 96H77M60 57V43Q47 32 49 23M68 54Q80 45 72 33M31 55L43 53M78 22L94 39"/>',
  magnifier:
    '<circle cx="54" cy="51" r="23"/><path d="M71 68L91 91M43 52L51 60L66 43M36 84L40 80"/>',
  tickets:
    '<path d="M33 38L77 27L93 83L49 95L33 38ZM42 57L85 45M56 34L60 44M70 87L66 74M59 57L64 62L73 50M28 29L26 65"/>',
  wave: '<path d="M27 45Q43 23 60 45T94 45M27 62Q43 40 60 62T94 62M27 79Q43 57 60 79T94 79"/>',
  orbit:
    '<circle cx="44" cy="46" r="14"/><circle cx="79" cy="75" r="14"/><path d="M28 65Q24 94 53 91M67 29Q96 25 94 55M33 31L25 33M88 91L93 93M52 57L69 65"/>',
  envelope:
    '<path d="M28 43H92V88H28ZM28 43L60 69L92 43M28 88L49 64M92 88L71 64M44 39V25H78V39M51 32H68"/>',
  cloud:
    '<path d="M40 63H85a16 16 0 0 0 0-32a24 24 0 0 0-44 1a16 16 0 0 0-1 31ZM43 75L38 86M60 75L55 86M77 75L72 86"/>',
  shield: '<path d="M60 27L87 39V60Q85 78 60 92Q35 78 33 60V39ZM46 58L57 68L77 47M52 18H68"/>',
  spiral:
    '<path d="M58 62Q56 53 65 52Q80 53 74 69Q65 88 45 74Q23 54 47 32Q81 11 96 49M33 87L42 92M29 29L34 24"/>',
  compass:
    '<circle cx="60" cy="60" r="30"/><path d="M76 43L65 66L43 77L54 54ZM60 24V30M60 90V96M24 60H30M90 60H96"/>',
  planet:
    '<circle cx="60" cy="61" r="23"/><ellipse cx="60" cy="61" rx="44" ry="12" transform="rotate(-28 60 61)"/><path d="M84 27V17M79 22H89M31 89V97M27 93H35"/>',
  bridge:
    '<path d="M26 84H94M33 84V40M87 84V40M33 47Q60 86 87 47M44 61V84M60 69V84M76 61V84M29 33H37M83 33H91"/>',
};
export function badgeArt(b, status = 'available') {
  const [light, mid, dark] = palettes[b.color];
  return `<svg class="badge-art badge-art--${status}" viewBox="0 0 120 124" aria-hidden="true" focusable="false" style="--badge-light:${light};--badge-mid:${mid};--badge-dark:${dark}">
    <path class="badge-shadow" d="${shapes[b.shape]}" transform="translate(0 4)"/>
    <path class="badge-face" d="${shapes[b.shape]}"/>
    <path class="badge-rim" d="${shapes[b.shape]}" transform="translate(6 6) scale(.9)"/>
    <g class="badge-motif" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${motifs[b.motif]}</g>
  </svg>`;
}
