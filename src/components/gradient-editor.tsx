import { useMemo, useState, useEffect } from "react";
import { Avatar } from "@components/avatar";
import {
  startColors,
  endColors,
  isValidHex,
  type Gradient
} from "@shared/gradients";

interface IHexInputProps {
  onChange: (color: string) => void;
  initialValue?: string;
}

export function FunHexInput(props: IHexInputProps) {
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
  }, [hex, props]);

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

interface IColorPickerProps {
  title?: string;
  colors: Gradient;
  onPress: (color: string, name: string) => void;
  name: string;
}

export function ColorPicker(
  props: IColorPickerProps = {
    colors: startColors,
    onPress: (color: string, name: string) => ({ color, name }),
    name: "Color Picker"
  }
) {
  return (
    <div className="outer">
      {props.title && <h4>{props.title}</h4>}
      <div>
        {props.colors.map((background) => (
          <div
            className="color-dot"
            onClick={() => props.onPress(background, props.name)}
            style={{ background }}
            key={background}
          />
        ))}
      </div>
      <FunHexInput onChange={(color) => props.onPress(color, props.name)} />
      <style jsx>
        {`
          .outer {
            width: 100%;
            padding: 1rem;
            margin: 1rem;
            border: 1px solid var(--onyx-100);
          }

          .color-dot {
            border-radius: 0.25rem;
            width: 2rem;
            height: 2rem;
            margin-bottom: 0.5rem;
          }
        `}
      </style>
    </div>
  );
}

interface IColors {
  a: string;
  b: string;
}

interface IGradientEditorProps {
  initialColors?: any;
  onColorChange: (value: string, name: string) => void;
  colors: IColors;
}

export function GradientEditor(props: IGradientEditorProps) {
  function handleColorChange(value: string, name: string): void {
    props.onColorChange(value, name);
  }

  const colors = useMemo<Gradient>(
    () => [props.colors.a, props.colors.b],
    [props.colors]
  );

  return (
    <div>
      <Avatar centered size={64} colors={colors} />
      <div>
        <ColorPicker
          title="Start Color"
          name="a"
          onPress={handleColorChange}
          colors={startColors}
        />
        <ColorPicker
          title="End Color"
          name="b"
          onPress={handleColorChange}
          colors={endColors}
        />
      </div>
    </div>
  );
}
