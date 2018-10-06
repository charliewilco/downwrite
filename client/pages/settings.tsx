import SettingsBlock from '../components/settings-block';
import Wrapper from '../components/wrapper';
import User from '../components/user';
import { withAuth } from '../components/auth';

const AuthedUserBlock = withAuth(User);

export default () => (
  <Wrapper>
    <AuthedUserBlock />
    <h3 className="f4 u-center">Settings</h3>
    <SettingsBlock title="User Settings">
      password, username, display name
    </SettingsBlock>
    <SettingsBlock title="Avatar">Gradient</SettingsBlock>
    <SettingsBlock title="Markdown">file extensions</SettingsBlock>
  </Wrapper>
);
