import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

interface IHexInputProps {
  onChange: (color: string) => void;
  initialValue?: string;
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
    const isValid = DefaultStyles.isValidHex(color);

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
