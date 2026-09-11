// Mirror the two-column grid's row-wise auto-placement without moving Numbers.
// A wide card can leave a gap in an earlier row; tall cards occupy two rows.
export function numberGridLayout(sizes) {
  const placements = [];
  const rows = [];
  let cursor = 0;
  for (const size of sizes) {
    const width = ['W', 'F'].includes(size) ? 2 : 1;
    const height = size === 'T' ? 2 : 1;
    while (true) {
      const row = Math.floor(cursor / 2),
        col = cursor % 2;
      if (
        col + width <= 2 &&
        Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => !rows[row + y]?.[col + x]).every(Boolean),
        ).every(Boolean)
      ) {
        for (let y = 0; y < height; y++) {
          rows[row + y] ||= [false, false];
          for (let x = 0; x < width; x++) rows[row + y][col + x] = true;
        }
        placements.push({ row: row + 1, column: col + 1, width, height });
        cursor += width;
        break;
      }
      cursor++;
    }
  }
  for (let row = 0; row < rows.length; row++) {
    const col = rows[row].indexOf(false);
    if (col !== -1) return { placements, vacancy: { row: row + 1, column: col + 1 } };
  }
  return { placements, vacancy: null };
}
export function numberGridVacancy(sizes) {
  return numberGridLayout(sizes).vacancy;
}
