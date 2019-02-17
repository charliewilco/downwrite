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

const FunHexInput: React.FC<IHexInputProps> = function(props) {
  const [hex, setHexColor] = React.useState<string>(props.initialValue || "");
  const handleChange = ({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>): void => {
    setHexColor(value);
  };

  React.useEffect(() => {
    const color = "#" + hex;
    const isValid = DefaultStyles.isValidHex(color);

    if (isValid && props.onChange) {
      props.onChange(color);
    }
  }, [hex]);

  return (
    <InputWrapper>
      <span>#</span>
      <Input value={hex.replace("#", "")} onChange={handleChange} />
    </InputWrapper>
  );
};

export default FunHexInput;
