import styled from "styled-components";
import { ToastNoPosition as Toast } from "./toast";

const StyledToast = styled(Toast)`
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
  margin-bottom: 32px;
`;

const SettingsTitleContainer = styled.header`
  flex: 1 1 192px;
  width: 100%;
  padding-right: 32px;
  margin-bottom: 32px;
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
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const SettingsFormActions = styled.div<{ split?: boolean }>`
  margin-top: 16px;
  display: flex;
  justify-content: ${props => (props.split ? "space-between" : "flex-end")};
`;

interface ISettingsBlockProps {
  title: string;
  description?: string;
}

const SettingsBlock: React.FC<ISettingsBlockProps> = ({
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
