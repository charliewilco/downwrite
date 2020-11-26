export const colors = {
  blue400: "#4fa5c2", // Main Color
  blue500: "#4382A1",
  blue700: "#185a70", //  Darker Main Color
  blue900: "#1f5671",
  blue100: "#d8eaf1", // Lighter Main Color
  gray100: "#f9fbfc", // Background
  gray200: "#dbdcdd",
  gray300: "#757575",
  gray400: "#868686", // Meta Highlighting Color
  gray700: "#282828", // Text Color
  yellow700: "#ffb600",
  yellow500: "#ffc200",
  text: "#4C4C4C"
};

/** UI Theme for Downwrite */
// tslint:disable-next-line: interface-name
export interface UIDefaultTheme {
  night: boolean;
  background: string;
  color: string;
  border: string;
  link: string;
  linkHover: string;
  meta: string;
  inputBorder: string;
  cardBackground: string;
  cardTrayBackground: string;
  cardDeleteButton: string;
  headerLogoLink: string;
  landingPageTitle: string;
}

// let colorsDefaults = {
//   defaultBlue: '#4fa5c2' /* Main Color */,
//   darkBlue: '#185a70' /* Darker Main Color */,
//   liteBlue: '#d8eaf1' /* Lighter Main Color */,
//   offWhite: '#f9fbfc' /* Background */,
//   liteGray: '#868686' /* Meta Highlighting Color */,
//   defaultGray: '#282828',
//   textGray: '#4c4c4c',
//   darkYellow: '#ffb600',
//   defaultYellow: '#ffc200'
// }

export const NIGHT_THEME: UIDefaultTheme = {
  night: true,
  background: "#022438", // "#093F5D", "#072a3e"
  color: colors.gray100,
  border: colors.gray200,
  link: colors.yellow700,
  linkHover: colors.blue100,
  meta: colors.gray200,
  inputBorder: "rgba(219, 220, 221, 0.24)",
  cardBackground: "#093f5d linear-gradient(45deg, #093f5d, #072A3E)",
  cardTrayBackground: "rgba(219, 220, 221, 0.24)",
  cardDeleteButton: colors.blue100,
  headerLogoLink: "#EDF0F1",
  landingPageTitle: colors.blue400
};

export const DAY_THEME: UIDefaultTheme = {
  night: false,
  background: colors.gray100,
  color: colors.text,
  border: colors.gray200,
  link: colors.blue400,
  linkHover: colors.blue100,
  meta: colors.gray300,
  inputBorder: "rgba(0, 0, 0, 0.125)",
  cardBackground: "#FFFFFF",
  cardTrayBackground: "rgba(101, 163, 191, 0.125)",
  cardDeleteButton: colors.blue700,
  headerLogoLink: colors.blue400,
  landingPageTitle: colors.blue900
};

export enum Fonts {
  monospace = "SF Mono, Input Mono Condensed, Roboto Mono, Menlo, monospace",
  sans = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  code = "'SF Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"
}

export const fonts = {};

export function isValidHex(hex: string): boolean {
  let valid = /^#[0-9A-F]{6}$/i.test(hex);
  return valid;
}

export const startColors: string[] = ["#f2d50f", "#7117ea"];

export const endColors: string[] = ["#da0641", "#ea6060"];
