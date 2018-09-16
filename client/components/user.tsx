import * as React from 'react';
import styled, { css } from 'styled-components';
import Avatar from './avatar';

interface IUserBlock {
  name: string;
  border: boolean;
  colors: string[];
}

const border = css`
  border-bottom: 1px solid ${props => props.theme.border};
`;

const UserBlockContainer = styled.div`
  text-align: center;
  padding: 32px 8px;
  ${(props: { border: boolean }) => props.border && border};
`;

const DisplayUser = styled.span`
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
`;
const UserBlock: React.SFC<IUserBlock> = ({ name, border, colors }) => (
  <UserBlockContainer border={border}>
    <Avatar centered colors={colors} />
    <DisplayUser>{name}</DisplayUser>
  </UserBlockContainer>
);

export default UserBlock;
