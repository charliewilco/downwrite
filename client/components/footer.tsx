import * as React from "react";
import styled from "../types/styled-components";
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

const FooterNav = styled.nav``;

const FooterList = styled.ul`
  list-style: none inside;
  padding: 0;
  margin: 0;
  display: flex;
  font-size: small;
  justify-content: space-around;
  flex-wrap: wrap;
  margin: 0 auto;
  max-width: 600px;
`;

const FooterListItem = styled.li`
  width: 50%;
  text-align: center;
  padding: 8px;

  @media (min-width: 48rem) {
    width: 25%;
  }
`;

const UIFooter: React.SFC<{}> = () => (
  <Footer>
    <Wrapper sm>
      <FooterNav>
        <FooterList>
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
