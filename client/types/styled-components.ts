import * as styledComponents from "styled-components";
import { ThemedStyledComponentsModule, StyledFunction } from "styled-components";

import { ITheme } from "../utils/defaultStyles";

const {
  default: styled,
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider
} = styledComponents as ThemedStyledComponentsModule<ITheme>;

export { css, createGlobalStyle, keyframes, ThemeProvider, StyledFunction };
export default styled;
