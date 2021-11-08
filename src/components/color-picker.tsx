import { FunHexInput } from "./hex-input";
import { Gradient, startColors } from "@utils/default-styles";

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
): JSX.Element {
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
