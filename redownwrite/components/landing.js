import styled from 'styled-components'
import { colors } from '../utils/defaultStyles'

const Intro = styled.div`
  color: ${colors.blue700};
  text-align: center;
  margin-bottom: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 320px;
  width: 100%;

  @media (min-width: 57.75rem) {
    padding-top: 64px;
  }
`

const IntroContent = styled.div`
  padding: 32px 0 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.landingPageTitle};

  span {
    font-weight: 700;
  }
`

const IntroTitle = styled.h1`
  color: ${props => (props.theme.night ? 'white' : '#185A70')};
  font-size: 24px;
  font-weight: 400;
  font-style: italic;
`

const StyledImage = styled.img.attrs({ src: '/static/landing.png' })`
  max-width: 200px;
  z-index: 0;
`

export default () => (
  <Intro>
    <StyledImage />
    <IntroContent>
      <IntroTitle data-testid="Login Page Container">Downwrite</IntroTitle>
      <span>A place to write</span>
    </IntroContent>
  </Intro>
)
