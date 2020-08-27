import * as React from "react";
import Avatar from "./avatar";
import ColorPicker from "./color-picker";
import * as DefaultStyles from "../utils/defaultStyles";

interface IColors {
  a: string;
  b: string;
}

interface IGradientEditorProps {
  initialColors?: any;
  onColorChange: (value: string, name: string) => void;
  colors: IColors;
}

export default function GradientEditor(props: IGradientEditorProps): JSX.Element {
  function handleColorChange(value: string, name: string): void {
    props.onColorChange(value, name);
  }

  const colorsToArray = ({ a, b }: IColors): string[] => {
    return [a, b];
  };

  const colors = colorsToArray(props.colors);

  return (
    <div className="Wrapper Wrapper--sm GradientEditorContainer">
      <Avatar className="GEAvatar" centered size={64} colors={colors} />
      <div className="Flexxy">
        <ColorPicker
          title="Start Color"
          name="a"
          onPress={handleColorChange}
          colors={DefaultStyles.startColors}
        />
        <ColorPicker
          title="End Color"
          name="b"
          onPress={handleColorChange}
          colors={DefaultStyles.endColors}
        />
      </div>
    </div>
  );
}
