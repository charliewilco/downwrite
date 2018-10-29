import * as React from "react";
import styled from "styled-components";
import Link from "next/link";

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
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 8px;
  padding-right: 8px;
`;

const FooterNav = styled.nav``;

const FooterList = styled.ul`
  list-style: none inside;
  padding: 0;
  margin: 0;
  display: flex;
  opacity: 0.875;
  font-size: small;
`;

const FooterListItem = styled.li`
  margin-left: 16px;
`;

const Anchor = styled.a``;

const UIFooter: React.SFC<any> = () => (
  <Footer>
    <FooterNav>
      <FooterList>
        {PAGES.map((page, i) => (
          <FooterListItem key={i}>
            <Link href={page.href} passHref>
              <Anchor>{page.name}</Anchor>
            </Link>
          </FooterListItem>
        ))}
      </FooterList>
    </FooterNav>
  </Footer>
);

export default UIFooter;
