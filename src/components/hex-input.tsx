import * as React from "react";

interface IHexInputProps {
  onChange: (color: string) => void;
  initialValue?: string;
}
function isValidHex(hex: string): boolean {
  let valid = /^#[0-9A-F]{6}$/i.test(hex);
  return valid;
}

export default function FunHexInput(props: IHexInputProps): JSX.Element {
  const [hex, setHexColor] = React.useState<string>(props.initialValue || "");

  function handleChange({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>): void {
    setHexColor(value);
  }

  React.useEffect(() => {
    const color = "#" + hex;
    const isValid = isValidHex(color);

    if (isValid && props.onChange) {
      props.onChange(color);
    }
  }, [hex]);

  return (
    <div className="HexInputWrapper">
      <span>#</span>
      <input
        value={hex.replace("#", "")}
        onChange={handleChange}
        type="text"
        className="HexInput"
        spellCheck={false}
        maxLength={6}
      />
    </div>
  );
}
