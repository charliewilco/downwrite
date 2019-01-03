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

export default class GradientEditor extends React.Component<
  IGradientEditorProps,
  {}
> {
  handleColorChange = (value: string, name: string) =>
    this.props.onColorChange(value, name);

  colorsToArray({ a, b }: IColors) {
    return [a, b];
  }

  render() {
    const { colors } = this.props;

    return (
      <Container>
        <StyledAvatar centered size={64} colors={this.colorsToArray(colors)} />
        <Flex>
          <ColorPicker
            title="Start Color"
            name="a"
            onPress={this.handleColorChange}
            colors={DefaultStyles.startColors}
          />
          <ColorPicker
            title="End Color"
            name="b"
            onPress={this.handleColorChange}
            colors={DefaultStyles.endColors}
          />
        </Flex>
      </Container>
    );
  }
}
