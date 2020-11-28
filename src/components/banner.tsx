import { PropsWithChildren } from "react";

export function Banner(props: PropsWithChildren<{}>) {
  return (
    <div
      role="banner"
      className="p-2 lg:p-4 font-mono border  border-pixieblue-400 bg-pixieblue-600 text-white rounded sm:max-w-xl mx-2 sm:mx-auto">
      {props.children}
    </div>
  );
}
