// Orders clothing / bangle sizes the way shoppers expect: XS, S, M, L, XL, XXL (2XL), 3XL...
// WooCommerce returns attribute options in the order they were typed, which is often wrong.

const UNKNOWN = 10000;

/** Lower = smaller. Returns UNKNOWN when the label is not a recognisable size. */
export const sizeRank = (label: string): number => {
  const raw = String(label).trim().toUpperCase();
  if (!raw) return UNKNOWN;

  // Combined sizes such as "S/M" or "L-XL": sit just after the first size.
  const combo = raw.split(/\s*[\/&,]\s*|\s+-\s+/);
  if (combo.length > 1) {
    const first = sizeRank(combo[0]);
    return first === UNKNOWN ? UNKNOWN : first + 5;
  }

  const s = raw.replace(/[\s_-]+/g, '');

  // Plain numbers (shoe size 38, waist 30, bangle 2.4 ...): ascending, after letter sizes.
  if (/^\d+(\.\d+)?$/.test(s)) return 1000 + parseFloat(s);

  const words: Record<string, number> = {
    FREESIZE: 500, ONESIZE: 500, FREE: 500, STANDARD: 500, UNIVERSAL: 500,
    SMALL: 30, MEDIUM: 40, LARGE: 50,
    EXTRASMALL: 20, EXTRALARGE: 60, XTRALARGE: 60,
  };
  if (s in words) return words[s];

  if (s === 'S') return 30;
  if (s === 'M') return 40;
  if (s === 'L') return 50;

  // X-Small / XX-Small and X-Large / XX-Large written out in words
  let w = s.match(/^(X+)SMALL$/);
  if (w) return 30 - 10 * w[1].length;
  w = s.match(/^(X+)LARGE$/);
  if (w) return 50 + 10 * w[1].length;

  // XS, XXS, 2XS ... (smaller than S)
  let m = s.match(/^(X+)S$/);
  if (m) return 30 - 10 * m[1].length;
  m = s.match(/^(\d+)XS$/);
  if (m) return 30 - 10 * parseInt(m[1], 10);

  // XL, XXL, XXXL, 2XL, 3XL ... (larger than L)
  m = s.match(/^(X+)L$/);
  if (m) return 50 + 10 * m[1].length;
  m = s.match(/^(\d+)XL$/);
  if (m) return 50 + 10 * parseInt(m[1], 10);

  return UNKNOWN;
};

/**
 * Sorts size-like options (stable). If the list is not made of sizes (colours, materials...)
 * it is returned unchanged.
 */
export const sortSizeOptions = <T,>(options: T[], getLabel: (o: T) => string = (o) => String(o)): T[] => {
  if (!Array.isArray(options) || options.length < 2) return options;
  const ranks = options.map(o => sizeRank(getLabel(o)));
  // Only reorder when every option is a recognised size.
  if (ranks.some(r => r === UNKNOWN)) return options;
  return options
    .map((o, i) => ({ o, i, r: ranks[i] }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.o);
};
