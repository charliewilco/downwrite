import * as React from "react";
import HexInput from "./hex-input";
import * as DefaultStyles from "../utils/defaultStyles";

interface IColorPickerProps {
  title?: string;
  colors: string[];
  onPress: (color: string, name: string) => void;
  name: string;
}

function ColorPicker(props: IColorPickerProps): JSX.Element {
  return (
    <div className="PickerContainer">
      {props.title && <h4 className="PickerTitle">{props.title}</h4>}
      <div className="SwatchContainer">
        {props.colors.map(color => (
          <div
            className="SwatchBox"
            onClick={() => props.onPress(color, props.name)}
            style={{ background: color }}
            key={color}
          />
        ))}
      </div>
      <HexInput onChange={color => props.onPress(color, props.name)} />
    </div>
  );
}

ColorPicker.defaultProps = {
  colors: [],
  onPress: (color: string, name: string) => ({ color, name }),
  name: "Color Picker"
};

export default ColorPicker;
