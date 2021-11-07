import classNames from "@utils/classnames";

export function CheckboxInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return (
    <input type="checkbox" {...props} className={classNames("", props.className)} />
  );
}
