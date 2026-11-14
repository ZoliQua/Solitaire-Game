/** A per-instance id safe for url(#…) references (React's useId values contain colons). */
export const svgId = (raw: string, prefix: string): string => `${prefix}${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
