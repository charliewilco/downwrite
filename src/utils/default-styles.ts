export enum Fonts {
  monospace = "SF Mono, Input Mono Condensed, Roboto Mono, Menlo, monospace",
  sans = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  code = "'SF Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"
}

const hexRegex = new RegExp(/^#[0-9A-F]{6}$/i);

export function isValidHex(hex: string): boolean {
  return hexRegex.test(hex);
}

export type Gradient = Readonly<[string, string]>;

export const startColors: Gradient = ["#f2d50f", "#7117ea"];
export const endColors: Gradient = ["#da0641", "#ea6060"];
export const AvatarColors: Gradient = ["#FEB692", "#EA5455"];

export const DEFAULT_GRADIENT: Gradient[] = [
  ["#FF4D4D", "#F9CB28"],
  ["#FF0080", "#7928CA"],
  ["#007CF0", "#00DFD8"]
];
