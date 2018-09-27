import * as React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Avatar from './avatar';
import { fonts } from '../utils/defaultStyles';

const AuthorContainer = styled.aside`
  display: block;
  max-width: 512px;
  margin: 0 auto;
  padding: 16px 8px;
  background: white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  font-family: ${fonts.monospace};
`;

const AuthorHeadline = styled.h6`
  font-size: 18px;
  font-style: italic;
  margin-left: 16px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
`;

const Copy = styled.p`
  margin-bottom: 0 !important;
  color: red;
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

const TeaserCopy: React.SFC<any> = () => (
  <>You can write and share on Downwrite, you can sign up or log in </>
);

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

const Author: React.SFC<IAuthorProps> = ({ colors, authed, name }) => (
  <AuthorContainer>
    <Header>
      <Avatar colors={colors} />
      <AuthorHeadline>Post from {name}</AuthorHeadline>
    </Header>
    {!authed && (
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
