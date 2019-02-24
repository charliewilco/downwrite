import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import Avatar from "./avatar";
import * as DefaultStyles from "../utils/defaultStyles";

const AuthorContainer = styled.aside`
  display: block;
  max-width: 512px;
  margin: 0 auto;
  padding: 16px 8px;
  background-color: ${props => props.theme.cardBackground};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
`;

const AuthorHeadline = styled.h6`
  font-size: 18px;
  font-weight: 400;
  margin-left: 16px;
`;

const AuthorHeader = styled.header`
  display: flex;
  align-items: center;
`;

const Copy = styled.p`
  margin-bottom: 0 !important;
  color: red;
  font-family: ${DefaultStyles.fonts.monospace};
  font-size: small;
  font-style: italic;
  color: #b4b4b4;
`;

const Rule = styled.hr`
  height: 1px;
  margin: 16px 0;
  border: 0;
  background: rgba(0, 0, 0, 0.125);
`;

const TeaserCopy: React.FC<{}> = () => (
  <>You can write and share on Downwrite, you can sign up or log in </>
);

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

const Author: React.FC<IAuthorProps> = props => (
  <AuthorContainer>
    <AuthorHeader>
      <Avatar colors={props.colors} />
      <AuthorHeadline>Post from {props.name}</AuthorHeadline>
    </AuthorHeader>
    {!props.authed && (
      <>
        <Rule />
        <Copy>
          <TeaserCopy />
          <Link prefetch href="/login">
            <a>here</a>
          </Link>
        </Copy>
      </>
    )}
  </AuthorContainer>
);

export default Author;
