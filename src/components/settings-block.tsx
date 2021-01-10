import classNames from "../utils/classnames";

interface ISettingsFormActionsProps extends React.PropsWithChildren<{}> {
  split?: boolean;
  className?: string;
}

export function SettingsFormActions(props: ISettingsFormActionsProps): JSX.Element {
  const className = classNames(
    "mt-4 flex justify-end",
    props.split && "justify-between",
    props.className
  );
  return <div className={className}>{props.children}</div>;
}

interface ISettingsBlockProps extends React.PropsWithChildren<{}> {
  title: string;
  description?: string;
}

export default function SettingsBlock(props: ISettingsBlockProps): JSX.Element {
  return (
    <section className="grid grid-cols-12 gap-4 dark:bg-onyx-800 shadow flex-wrap mb-8 p-4">
      <div className="col-span-12 lg:col-span-3">
        <h4 className="text-base mb-2 font-bold">{props.title}</h4>
        {props.description && (
          <p className="opacity-75 text-xs font-light italic">{props.description}</p>
        )}
      </div>
      <div className="col-span-12 lg:col-span-9">{props.children}</div>
    </section>
  );
}
