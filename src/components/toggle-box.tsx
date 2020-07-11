import Check from "./checkbox";

interface ICheckboxToggle {
  value: boolean;
  name?: string;
  label: (value: boolean) => string;
  onChange: (e: React.ChangeEvent) => void;
}

export function ToggleBox(props: ICheckboxToggle) {
  const text = props.label(props.value);
  return (
    <div className="mr-4">
      <label className="text-xs flex items-center">
        <Check name={props.name} checked={props.value} onChange={props.onChange} />
        <span className="flex-1 ml-2 align-middle inline-block leading-tight">
          {text}
        </span>
      </label>
    </div>
  );
}
