import React from "react";
import styled from "styled-components";
import Check from "./checkbox";

const Container = styled.div`
  margin-right: 16px;
`;

const LabelFlex = styled.label`
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  flex: 1;
  margin-left: 8px;
  display: inline-block;
  vertical-align: middle;
  line-height: 1.2;
`;

interface ICheckboxToggle {
  value: boolean;
  label: (value: boolean) => string;
  onChange: () => void;
}

export const ToggleBox: React.SFC<ICheckboxToggle> = ({
  value,
  label,
  onChange
}) => {
  const text = label(value);
  return (
    <Container>
      <LabelFlex>
        <Check checked={value} onChange={onChange} />
        <Label>{text}</Label>
      </LabelFlex>
    </Container>
  );
};
