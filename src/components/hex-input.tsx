import { useState, useEffect } from "react";

interface IHexInputProps {
  onChange: (color: string) => void;
  initialValue?: string;
}

function isValidHex(hex: string): boolean {
  let valid = /^#[0-9A-F]{6}$/i.test(hex);
  return valid;
}

export function FunHexInput(props: IHexInputProps): JSX.Element {
  const [hex, setHexColor] = useState<string>(props.initialValue || "");

  function handleChange({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>): void {
    setHexColor(value);
  }

  useEffect(() => {
    const color = "#" + hex;
    const isValid = isValidHex(color);

    if (isValid && props.onChange) {
      props.onChange(color);
    }
  }, [hex]);

  return (
    <div>
      <span
        style={{
          background: "#dadada",
          color: "#4f4f4f"
        }}>
        #
      </span>
      <input
        value={hex.replace("#", "")}
        onChange={handleChange}
        type="text"
        spellCheck={false}
        maxLength={6}
      />
    </div>
  );
}
