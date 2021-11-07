import { HTMLAttributes } from "react";

interface IPageTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function PageTitle({ children, ...props }: IPageTitleProps) {
  return (
    <h1 {...props}>
      {children}
      <style jsx>
        {`
          h1 {
            font-weight: 700;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            line-height: 2rem;
          }
        `}
      </style>
    </h1>
  );
}
