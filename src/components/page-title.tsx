import { HTMLAttributes } from "react";
import classNames from "../utils/classnames";

interface IPageTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function PageTitle(props: IPageTitleProps) {
  return <h1 {...props} className={classNames("text-2xl mb4 font-bold")} />;
}
