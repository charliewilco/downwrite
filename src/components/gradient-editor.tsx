import { useMemo } from "react";
import { Avatar } from "./avatar";
import { ColorPicker } from "./color-picker";

import { startColors, endColors, Gradient } from "@utils/default-styles";

interface IColors {
  a: string;
  b: string;
}

interface IGradientEditorProps {
  initialColors?: any;
  onColorChange: (value: string, name: string) => void;
  colors: IColors;
}

export function GradientEditor(props: IGradientEditorProps): JSX.Element {
  function handleColorChange(value: string, name: string): void {
    props.onColorChange(value, name);
  }

  const colors = useMemo<Gradient>(
    () => [props.colors.a, props.colors.b],
    [props.colors]
  );

  return (
    <div className="my-64">
      <Avatar className="mb-32" centered size={64} colors={colors} />
      <div className="flex items-center flex-wrap justify-between">
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
