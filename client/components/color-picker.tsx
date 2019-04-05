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
      {props.title && <h4>{props.title}</h4>}
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
      <style jsx>{`
        h4 {
          font-size: 13px;
          opacity: 0.5;
          font-weight: 400;
          margin: 0 0 8px 0;
          font-family: ${DefaultStyles.Fonts.sans};
        }

        .PickerContainer {
          padding: 4px;
          margin: 4px;
          border-radius: 4px;
          border: 1px solid #f3f3f3;
          width: 100%;
          flex: 1 1 248px;
          width: 100%;
        }

        .SwatchBox {
          width: 30px;
          height: 30px;
          margin: 0 4px 8px;
          border-radius: 4px;
        }

        .SwatchContainer {
          display: flex;
          flex-wrap: wrap;
          flex: 1;
          align-content: center;
          margin-left: -2px;
        }
      `}</style>
    </div>
  );
}

ColorPicker.defaultProps = {
  colors: [],
  onPress: (color: string, name: string) => ({ color, name }),
  name: "Color Picker"
};

export default ColorPicker;
