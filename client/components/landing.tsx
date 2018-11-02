import styled from "styled-components";

const Intro = styled.article`
  text-align: center;
  margin-bottom: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 33rem;
  width: 100%;

  @media (min-width: 57.75rem) {
    padding-top: 64px;
  }
`;

const IntroContent = styled.div`
  padding: 32px 0 0;
  margin-bottom: 64px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;

  span {
    font-weight: 700;
    color: ${props => props.theme.landingPageTitle};
  }
`;

const IntroTitle = styled.h1`
  color: ${props => (props.theme.night ? "white" : "#185A70")};
  font-size: 24px;
  font-weight: 400;
  font-style: italic;
`;

const StyledImage = styled.img.attrs({ src: "/static/landing.png" })`
  max-width: 200px;
  z-index: 0;
`;

const LandingPage: React.SFC<{ children: React.ReactNode }> = ({ children }) => (
  <Intro>
    <StyledImage />
    <IntroContent>
      <IntroTitle data-testid="Login Page Container">Downwrite</IntroTitle>
      <span>A place to write</span>
    </IntroContent>
    {children}
  </Intro>
);

export default LandingPage;
