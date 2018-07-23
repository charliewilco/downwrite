import styled from 'styled-components'
import Toggle from './toggle'
import { colors } from '../utils/defaultStyles'

const SelectedTitle = styled.h2`
  margin-bottom: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 400;
`

const ToggleLoginButton = styled.button`
  width: 50%;
  border: 0px;
  appearance: none;
  border-radius: 0px;
  border-bottom-width: 3px;
  border-bottom-style: solid;
  padding-top: 16px;
  padding-bottom: 16px;
  font-family: inherit;
  font-size: 14px;
  background: inherit;
  box-sizing: inherit;
  border-bottom-color: ${props => (props.active ? colors.yellow700 : 'transparent')};
  color: ${props => (props.active ? colors.yellow700 : 'inherit')};
`

const ToggleButtonContainer = styled.div`
  display: flex;
`

const LoginFormWrapper = styled.div`
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  max-width: 544px;
  width: 100%;
  background: white;
  color: ${colors.text};
`

export default ({ children }) => (
  <Toggle defaultOpen>
    {(isOpen, toggleInstance, closeInstance, setInstance) => (
      <LoginFormWrapper>
        <ToggleButtonContainer>
          <ToggleLoginButton active={!isOpen} onClick={() => setInstance(false)}>
            Register
          </ToggleLoginButton>
          <ToggleLoginButton active={isOpen} onClick={() => setInstance(true)}>
            Login
          </ToggleLoginButton>
        </ToggleButtonContainer>
        <div>
          <header style={{ padding: 16 }}>
            <SelectedTitle>
              {isOpen ? 'Welcome Back!' : 'Sign Up as a New User'}
            </SelectedTitle>
          </header>
          {children(isOpen)}
        </div>
      </LoginFormWrapper>
    )}
  </Toggle>
)
