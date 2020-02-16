/* eslint-disable no-console */
import * as React from "react";

export function useLogging(label: string, deps: any[]) {
  React.useEffect(() => console.log(label, deps), [deps, label]);
}
