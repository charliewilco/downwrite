import styled from "styled-components";
import { ToastNoPosition as Toast } from "./toast";
import { fonts } from "../utils/defaultStyles";

const StyledToast = styled(Toast)`
  padding: 16px;
  margin-bottom: 32px;
`;

const SettingsTitle = styled.h4`
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  opacity: 0.5;
  letter-spacing: 0.12em;
  font-family: ${fonts.sans};
  margin-bottom: 16px;
`;

export default ({ children, title }) => (
  <StyledToast>
    <SettingsTitle>{title}</SettingsTitle>
    <div>{children}</div>
  </StyledToast>
);
