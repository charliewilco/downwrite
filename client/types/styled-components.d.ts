import "styled-components";

// and extend it
declare module "styled-components" {
  export interface DefaultTheme {
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
}
