/* eslint-disable no-console */
import { useEffect } from "react";

export function useLogging(label: string, deps: any[]) {
  useEffect(() => console.log(label, deps), [deps, label]);
}
