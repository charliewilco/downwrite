import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import AltAnchor from "./alt-anchor-link";
import Wrapper from "./wrapper";

interface IPage {
  name: string;
  href: string;
}

const PAGES: IPage[] = [
  { name: "About", href: "/about" },
  { name: "Legal", href: "/legal" },
  { name: "Source Code", href: "https://github.com/charliewilco/downwrite" },
  { name: "@charlespeters", href: "https://twitter.com/charlespeters" }
];

const Footer = styled.footer`
  padding-top: 32px;
  padding-bottom: 32px;
  padding-left: 8px;
  padding-right: 8px;
`;

const FooterNav = styled.nav`
  &::before {
    content: "";
    display: block;
    width: 64px;
    height: 3px;
    background: ${props => props.theme.link};
    margin-bottom: 32px;
  }
`;

const FooterList = styled.ul`
  list-style: none inside;
  padding: 0;
  margin: 0;
  font-size: 14px;
`;

const FooterListItem = styled.li`
  display: inline-block;
  margin-right: 16px;
`;

const UIFooter: React.FC<{}> = () => (
  <Footer>
    <Wrapper sm>
      <FooterNav>
        <FooterList>
          <FooterListItem>
            <span>&copy; 2018 Charles Peters</span>
          </FooterListItem>
          {PAGES.map((page, i) => (
            <FooterListItem key={i}>
              <Link href={page.href} passHref>
                <AltAnchor>{page.name}</AltAnchor>
              </Link>
            </FooterListItem>
          ))}
        </FooterList>
      </FooterNav>
    </Wrapper>
  </Footer>
);

export default UIFooter;
