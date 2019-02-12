import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import Router from "next/router";
import Wrapper from "./wrapper";
import Button from "./button";
import Nib from "./nib";

const EmptyBlockRight = styled.div`
  width: 100%;
  max-width: 384px;
  margin-bottom: 32px;
  flex: 1;
`;

const EmptyBlockLeft = styled.div`
  text-align: center;
  flex: 1;
`;

const GetStarted = styled.a`
  color: #757575;
  cursor: pointer;
`;

const Flex = styled.div`
  padding-top: 64px;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const EmptyTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 16px;
`;

export const SidebarEmpty = () => (
  <Flex>
    <Button onClick={() => Router.push("/new")}>Get Started</Button>
  </Flex>
);

const Empty: React.FC<{}> = function() {
  return (
    <Wrapper data-testid="NO_ENTRIES_PROMPT">
      <Flex>
        <EmptyBlockRight>
          <Nib />
        </EmptyBlockRight>
        <EmptyBlockLeft>
          <EmptyTitle>Looks like you don't have any entries</EmptyTitle>
          <Link href="/new">
            <GetStarted>Get Started &rarr;</GetStarted>
          </Link>
        </EmptyBlockLeft>
      </Flex>
    </Wrapper>
  );
};

export default Empty;
