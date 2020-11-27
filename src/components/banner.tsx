import { PropsWithChildren } from "react";

export function Banner(props: PropsWithChildren<{}>) {
  return (
    <div
      role="banner"
      className="p-4 font-mono border border-2 border-pixieblue-400 text-pixieblue-400 rounded max-w-2xl mx-auto">
      {props.children}
    </div>
  );
}
