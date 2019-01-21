import * as React from "react";
import styled from "styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

const attrs = { type: "text", spellCheck: false, maxLength: 6 };

const Input = styled.input.attrs(attrs)`
  display: block;
  width: 100%;
  padding: 2px;
  font-size: 14px;
  border: 0;
  font-family: inherit;
`;

const InputWrapper = styled.div`
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 4px;
  overflow: hidden;
  font-family: ${DefaultStyles.fonts.monospace};
  & > span {
    max-width: 24px;
    font-size: 14px;
    font-weight: 700;
    padding: 4px 8px;
    color: #4f4f4f;
    background: #dadada;
    text-align: center;
  }
`;

interface IHexInputProps {
  onChange: (color: string) => void;
  initialValue?: string;
}

interface IHexInputState {
  hex: string;
}

export default class HexInput extends React.PureComponent<
  IHexInputProps,
  IHexInputState
> {
  state = {
    hex: this.props.initialValue || ""
  };

  static defaultProps = {
    onChange: (color: string): void => {
      color;
    }
  };

  handleChange = ({
    target: { value: hex }
  }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ hex });
  };

  componentDidUpdate(prevProps: IHexInputProps, prevState: IHexInputState) {
    const { hex } = this.state;
    let color = "#" + hex;
    let prevColor = "#" + prevState.hex;

    if (prevColor !== color) {
      DefaultStyles.isValidHex(color) && this.props.onChange(color);
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.state.hex !== nextState.hex;
  // }

  render() {
    const { hex } = this.state;
    return (
      <InputWrapper>
        <span>#</span>
        <Input value={hex.replace("#", "")} onChange={this.handleChange} />
      </InputWrapper>
    );
  }
}
