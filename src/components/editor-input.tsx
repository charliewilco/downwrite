import classNames from "@utils/classnames";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={classNames(
        "font-mono block w-full appearance-none font-normal text-4xl border-t-0 border-l-0 border-r-0 border-b-1 transition-colors duration-200 ease-linear py-2 px-0 bg-transparent outline-none",
        props.className
      )}
    />
  );
}
