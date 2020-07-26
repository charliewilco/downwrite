export enum Fonts {
  monospace = "Jetbrains Mono, SF Mono, Input Mono Condensed, Roboto Mono, Menlo, monospace"
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

export function pickRandomGradient(colors: Gradient[] = DEFAULT_GRADIENT): Gradient {
  return colors[Math.floor(Math.random() * colors.length)];
}
