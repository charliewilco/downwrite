import { useMemo } from "react";
import Avatar from "./avatar";
import ColorPicker from "./color-picker";
import * as DefaultStyles from "../utils/default-styles";

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

  const colors = useMemo(() => [props.colors.a, props.colors.b], [props.colors]);

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
