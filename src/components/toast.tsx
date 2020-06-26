import classNames from "../utils/classnames";

// TODO: container should have the positioning
// Should be UI style and layout style from container

export default function Toast(props: React.HTMLAttributes<HTMLDivElement>) {
  const className = classNames("Toast", props.className);
  return <div {...props} className={className} />;
}

export function ToastNoPosition(props: React.HTMLAttributes<HTMLDivElement>) {
  const className = classNames("ToastNoPosition", props.className);
  return <div {...props} className={className} />;
}
