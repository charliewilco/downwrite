import classNames from "../utils/classnames";

interface ISettingsFormActionsProps {
  split?: boolean;
  className?: string;
}

export const SettingsFormActions: React.FC<ISettingsFormActionsProps> = (props) => {
  const className = classNames(
    "mt-4 flex justify-end",
    props.split && "justify-between",
    props.className
  );
  return <div className={className}>{props.children}</div>;
};

interface ISettingsBlockProps {
  title: string;
  description?: string;
}

const SettingsBlock: React.FC<ISettingsBlockProps> = (props) => {
  return (
    <section className="grid grid-cols-12 gap-4 dark:bg-onyx-800 shadow flex-wrap mb-8 p-4">
      <div className="col-span-12 lg:col-span-3">
        <h4 className="text-lg mb-2 font-bold">{props.title}</h4>
        {props.description && (
          <p className="opacity-75 text-xs font-light italic">{props.description}</p>
        )}
      </div>
      <div className="col-span-12 lg:col-span-9">{props.children}</div>
    </section>
  );
};

export default SettingsBlock;
