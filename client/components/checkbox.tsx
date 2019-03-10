import * as React from "react";

export default function CheckboxInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <>
      <input type="checkbox" {...props} />
      <style jsx>{`
        input[type="checkbox"] {
          display: inline-block;
          border-radius: 4px;
          vertical-align: middle;
          width: 20px;
          height: 20px;
          appearance: none;
          border: ${props.checked ? 1 : 0}px;
          background: #d0d0d0;
        }
        input[type="checkbox"]:focus {
          outline: 1px solid var(--link);
        }

        input[type="checkbox"]:checked {
          background: var(--link)
            url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkx
JQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy
9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yM
DAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPgo8cGF0
aCBmaWxsPSd3aGl0ZScgZD0iTTkgMTYuMTdMNC44MyAxMmwtMS40MiAxLjQxTDkgMTkgMjEgN2w
tMS40MS0xLjQxeiAiPjwvcGF0aD48L3N2Zz4=")
            no-repeat center center !important;
        }
      `}</style>
    </>
  );
}
