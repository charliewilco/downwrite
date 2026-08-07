import { useEffect } from "preact/hooks";

export function ElementRegistry() {
  useEffect(() => {
    void import("./document-elements.js");
  }, []);

  return null;
}
