import * as React from "react";
import styled from "styled-components";
import HexInput from "./hex-input";
import * as DefaultStyles from "../utils/defaultStyles";

const SwatchBox = styled.div`
  background: ${props => props.color};
  width: 30px;
  height: 30px;
  margin: 0 4px 8px;
  border-radius: 4px;
`;

const SwatchContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-content: center;
  margin-left: -2px;
`;

const PickerContainer = styled.div`
  padding: 4px;
  margin: 4px;
  border-radius: 4px;
  border: 1px solid #f3f3f3;
  width: 100%;
  flex: 1 1 248px;
  width: 100%;
`;

const PickerTitle = styled.h4`
  font-size: 13px;
  opacity: 0.5;
  font-weight: 400;
  margin: 0 0 8px 0;
  font-family: ${DefaultStyles.fonts.sans};
`;

interface IColorPickerProps {
  title?: string;
  colors: string[];
  onPress: (color: string, name: string) => void;
  name: string;
}

const ColorPicker: React.FC<IColorPickerProps> = function(props) {
  return (
    <PickerContainer>
      {props.title && <PickerTitle>{props.title}</PickerTitle>}
      <SwatchContainer>
        {props.colors.map(color => (
          <SwatchBox
            onClick={() => props.onPress(color, props.name)}
            color={color}
            key={color}
          />
        ))}
      </SwatchContainer>
      <HexInput onChange={color => props.onPress(color, props.name)} />
    </PickerContainer>
  );
};

ColorPicker.defaultProps = {
  colors: [],
  onPress: (color: string, name: string) => ({ color, name }),
  name: "Color Picker"
};

export default ColorPicker;
