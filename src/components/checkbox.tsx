import classNames from "../utils/classnames";

export default function CheckboxInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return (
    <input type="checkbox" {...props} className={classNames("", props.className)} />
  );
}
