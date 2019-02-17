import * as React from "react";
import styled from "styled-components";
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

const Container = styled.div`
  max-width: 512px;
  margin: 64px auto;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const StyledAvatar = styled(Avatar)`
  margin-bottom: 36px;
`;

const GradientEditor: React.FC<IGradientEditorProps> = function(props) {
  const handleColorChange = (value: string, name: string): void => {
    props.onColorChange(value, name);
  };

  const colorsToArray = ({ a, b }: IColors): string[] => {
    return [a, b];
  };

  return (
    <Container>
      <StyledAvatar centered size={64} colors={colorsToArray(props.colors)} />
      <Flex>
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
      </Flex>
    </Container>
  );
};

export default GradientEditor;
