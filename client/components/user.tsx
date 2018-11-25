import * as React from "react";
import styled, { css } from "../types/styled-components";
import Link from "next/link";
import Avatar from "./avatar";

interface IUserBlock {
  name: string;
  border: boolean;
  colors: string[];
}

const border = css`
  border-bottom: 1px solid ${props => props.theme.border};
`;

const UserBlockContainer = styled.div`
  position: relative;
  text-align: center;
  padding: 32px 8px;
  ${(props: { border: boolean }) => props.border && border};
`;

const DisplayUser = styled.span`
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
`;

const UserAnchor = styled.a`
  position: absolute;
  top: 0;
  padding: 8px;
  right: 0;
  font-size: small;
  font-weight: 700;
`;

const SettingsLink = () => (
  <Link href="/settings" passHref>
    <UserAnchor>Settings</UserAnchor>
  </Link>
);

const UserBlock: React.SFC<IUserBlock> = ({ name, border, colors }) => (
  <UserBlockContainer border={border}>
    <SettingsLink />
    <Avatar centered colors={colors} />
    <DisplayUser>{name}</DisplayUser>
  </UserBlockContainer>
);

export default UserBlock;
