import classNames from "../utils/classnames";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={classNames(
        "block w-full appearance-none font-normal text-4xl border-b-1 transition-colors duration-200 ease-linear py-2 px-0 bg-transparent outline-none",
        props.className
      )}
    />
  );
}
