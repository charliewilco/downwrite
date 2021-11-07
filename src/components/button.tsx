import classNames from "../utils/classnames";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button(props: IButtonProps): JSX.Element {
  return (
    <button
      {...props}
      className={classNames(
        "bg-pixieblue-400 text-white dark:bg-pixieblue-600 shadow-md font-sm py-1 px-5 cursor-pointer font-bold rounded box-border hover:bg-pixieblue-900 hover:text-white transition-colors duration-500 ease-in-out",
        props.className
      )}
    />
  );
}

export function AltButton(props: IButtonProps): JSX.Element {
  return (
    <button
      {...props}
      className={classNames("border-0 box-border cursor-pointer ", props.className)}
    />
  );
}

export function CancelButton(props: IButtonProps): JSX.Element {
  return (
    <button {...props} className={classNames("CancelButton", props.className)} />
  );
}
