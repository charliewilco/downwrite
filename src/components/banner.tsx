import { PropsWithChildren } from "react";

export function Banner(props: PropsWithChildren<{ icon: JSX.Element }>) {
  return (
    <div className="inset-x-0 pb-2 sm:pb-5" role="banner">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-pixieblue-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-3 rounded-lg bg-pixieblue-800">
                {props.icon}
              </span>
              <p className="ml-3 font-bold text-sm text-white">{props.children}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
