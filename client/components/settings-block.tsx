import styled from "styled-components";
import { ToastNoPosition as Toast } from "./toast";

const StyledToast = styled(Toast)`
  padding: 16px;
  margin-bottom: 32px;
`;

const SettingsTitle = styled.h4`
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 16px;
`;

export default ({ children, title }) => (
  <StyledToast>
    <SettingsTitle>{title}</SettingsTitle>
    <div>{children}</div>
  </StyledToast>
);
