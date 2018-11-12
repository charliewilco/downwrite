import styled from "styled-components";
import { ToastNoPosition as Toast } from "./toast";
import { fonts } from "../utils/defaultStyles";

const StyledToast = styled(Toast)`
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
  font-family: ${fonts.sans};
  margin-bottom: 32px;
`;

const SettingsTitleContainer = styled.header`
  flex: 1 1 25%;
  padding-right: 32px;
  p {
    opacity: 0.75;
    font-size: 11px;
    font-weight: 300;
    font-style: italic;
  }
`;

const SettingsContent = styled.div`
  padding: 8px 0 0 0;
  flex: 1 1 62.5%;
`;

const SettingsTitle = styled.h4`
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 16px;
`;

export const SettingsFormActions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

interface ISettingsBlockProps {
  title: string;
  description?: string;
}

const SettingsBlock: React.SFC<ISettingsBlockProps> = ({
  children,
  title,
  description
}) => (
  <StyledToast>
    <SettingsTitleContainer>
      <SettingsTitle>{title}</SettingsTitle>
      {description && <p>{description}</p>}
    </SettingsTitleContainer>
    <SettingsContent>{children}</SettingsContent>
  </StyledToast>
);

export default SettingsBlock;
