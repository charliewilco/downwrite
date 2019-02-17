import * as React from "react";
import styled, { css } from "styled-components";
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

const UserBlock: React.FC<IUserBlock> = props => {
  return (
    <UserBlockContainer border={props.border}>
      <Avatar centered colors={props.colors} />
      <DisplayUser>{props.name}</DisplayUser>
    </UserBlockContainer>
  );
};

export default UserBlock;
