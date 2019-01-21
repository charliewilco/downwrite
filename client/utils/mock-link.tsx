import * as React from "react";

export interface MockLinkProps {
  prefetch?: boolean;
  shallow?: boolean;
  scroll?: boolean;
  replace?: boolean;
  onError?(error: any): void;
  href?: string;
  as?: string;
  passHref?: boolean;
  children: React.ReactElement<any>;
}

const MockLink: React.FC<MockLinkProps> = ({
  passHref,
  as,
  href,
  children,
  ...linkProps
}) => {
  let props: Partial<MockLinkProps> = {};

  console.log("Mocking card");

  if (href) {
    if (as) {
      props.href = as;
    }
    props.href = href;
  }

  if (passHref) {
    return React.cloneElement(children, props);
  }

  return <>{children}</>;
};

export default MockLink;
