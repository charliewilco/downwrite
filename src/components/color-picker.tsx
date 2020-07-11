import HexInput from "./hex-input";

interface IColorPickerProps {
  title?: string;
  colors: string[];
  onPress: (color: string, name: string) => void;
  name: string;
}

function ColorPicker(
  props: IColorPickerProps = {
    colors: [],
    onPress: (color: string, name: string) => ({ color, name }),
    name: "Color Picker"
  }
): JSX.Element {
  return (
    <div className="p-1 m-1 rounded w-full max-w-xxs flex-1 border-onyx-100">
      {props.title && <h4 className="opacity-50 mb-2 text-xs">{props.title}</h4>}
      <div className="flex flex-wrap flex-1 items-center -m-1">
        {props.colors.map(background => (
          <div
            className="w-8 h-8 mt-0 mx-1 mb-2 rounded"
            onClick={() => props.onPress(background, props.name)}
            style={{ background }}
            key={background}
          />
        ))}
      </div>
      <HexInput onChange={color => props.onPress(color, props.name)} />
    </div>
  );
}

export default ColorPicker;
