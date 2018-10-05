import styled from 'styled-components';
import { ToastNoPosition as Toast } from './toast';

const SettingsTitle = styled.h4`
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 16px;
`;

export default ({ children, title }) => (
  <Toast>
    <SettingsTitle>{title}</SettingsTitle>
    <div>{children}</div>
  </Toast>
);
